import React, { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { C } from "./constants";

interface GateScreenProps {
  onClose: () => void;
}

// ── helpers ────────────────────────────────────────────────────────────────────

function sanitizeDisplayName(raw: string): string {
  // Strip HTML tags and trim to 32 chars; allow only printable characters
  return raw.replace(/<[^>]*>/g, "").replace(/[^\x20-\x7E]/g, "").slice(0, 32).trim();
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score === 2) return { score, label: "Fair", color: "#f59e0b" };
  if (score === 3) return { score, label: "Good", color: "#eab308" };
  return { score, label: "Strong", color: "#22c55e" };
}

function friendlyError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials"))
    return "Incorrect email or password.";
  if (msg.includes("user already registered") || msg.includes("already registered"))
    return "An account with this email already exists. Sign in instead.";
  if (msg.includes("password should be"))
    return "Password must be at least 6 characters.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Network error. Check your connection and try again.";
  return raw;
}

// ── password strength bar ──────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);
  return (
    <div style={{ marginTop: "4px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "2px",
              background: i <= score ? color : "rgba(255,255,255,0.1)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: "11px", color, fontFamily: C.mono, textAlign: "right" }}>
        {label}
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export function GateScreen({ onClose }: GateScreenProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (mode: "signin" | "signup" | "forgot") => {
    setAuthMode(mode);
    setError(null);
    setInfo(null);
    setPassword("");
    setConfirm("");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${C.border}`,
    borderRadius: "8px",
    padding: "12px 14px",
    color: C.primary,
    fontSize: "14px",
    fontFamily: C.font,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  };

  // ── forgot password ──────────────────────────────────────────────────────────

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim()) { setError("Enter your email address first."); return; }
    setAuthLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setAuthLoading(false);
    if (err) setError(friendlyError(err.message));
    else setInfo("Password reset link sent! Check your inbox (and spam folder).");
  };

  // ── sign-up ──────────────────────────────────────────────────────────────────

  const handleSignUp = useCallback(async () => {
    const cleanName = sanitizeDisplayName(displayName);
    if (!cleanName) { setError("Please enter a display name."); return; }
    if (cleanName.length < 2) { setError("Display name must be at least 2 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    const { score } = getPasswordStrength(password);
    if (score < 2) {
      setError("Password is too weak. Add uppercase letters, numbers, or symbols.");
      return;
    }

    setAuthLoading(true);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { display_name: cleanName },
      },
    });

    if (signUpErr) {
      setError(friendlyError(signUpErr.message));
      setAuthLoading(false);
      return;
    }

    // Detect duplicate: identities array is empty when email is already registered.
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      setError("An account with this email already exists. Sign in instead.");
      setAuthLoading(false);
      return;
    }

    // Persist display_name to profiles table
    if (data.user) {
      await supabase
        .from("profiles")
        .upsert({ id: data.user.id, display_name: cleanName }, { onConflict: "id" });
    }

    // Auto sign-in immediately — no email confirmation required
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setAuthLoading(false);

    if (signInErr) {
      // Sign-up succeeded but auto sign-in failed (e.g. confirmation still enabled on server)
      setInfo("Account created! Sign in to continue.");
      switchMode("signin");
    } else {
      onClose();
    }
  }, [email, displayName, password, confirm, onClose]);

  // ── sign-in ──────────────────────────────────────────────────────────────────

  const handleSignIn = useCallback(async () => {
    setAuthLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (err) {
      setError(friendlyError(err.message));
      setAuthLoading(false);
      return;
    }

    // Sync display_name to profiles on successful sign-in (ensures it's always up to date)
    if (data.user) {
      const savedName =
        (data.user.user_metadata?.display_name as string | undefined) ??
        data.user.email?.split("@")[0] ?? "player";
      await supabase
        .from("profiles")
        .upsert({ id: data.user.id, display_name: savedName }, { onConflict: "id" });
    }

    setAuthLoading(false);
    onClose();
  }, [email, password, onClose]);

  // ── submit dispatcher ────────────────────────────────────────────────────────

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (authMode === "forgot") { handleForgotPassword(e); return; }
    if (authMode === "signup") handleSignUp();
    else handleSignIn();
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Graphic */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "rgba(245, 197, 24, 0.08)",
          border: "2px solid rgba(245, 197, 24, 0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          color: "var(--ps-amber)",
        }}>
          {authMode === "forgot" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3.5h12l-1 7.5a5 5 0 0 1-5 4.5 5 5 0 0 1-5-4.5L6 3.5z" />
              <path d="M6 5C3.5 5 2.5 7 3.5 10.5" />
              <path d="M18 5C20.5 5 21.5 7 20.5 10.5" />
              <path d="M11 15.5c0 2-.8 3.5-1.5 5" />
              <path d="M13 15.5c0 2 .8 3.5 1.5 5" />
              <rect x="7" y="20.5" width="10" height="2.5" rx="1" />
            </svg>
          )}
        </div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: C.primary, fontFamily: C.font, marginBottom: "8px", lineHeight: 1.2 }}>
          {authMode === "signin" ? "See where you rank" : authMode === "signup" ? "Join the leaderboard" : "Reset your password"}
        </div>
        {authMode !== "signin" && (
          <div style={{ fontSize: "13px", color: C.secondary, fontFamily: C.font, lineHeight: 1.5, maxWidth: "260px", margin: "0 auto" }}>
            {authMode === "signup"
              ? "Create an account to save your streak and compete globally."
              : "Enter your email and we'll send a reset link."}
          </div>
        )}
      </div>

      <div style={{ height: "1px", background: C.border, margin: "20px 0" }} />

      <div style={{ fontSize: "13px", fontWeight: 600, color: C.primary, marginBottom: "14px", fontFamily: C.font }}>
        {authMode === "signin" ? "Sign in to continue" : authMode === "signup" ? "Create account" : "Forgot password"}
      </div>

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Display name — sign up only */}
        {authMode === "signup" && (
          <div>
            <input
              type="text"
              placeholder="Your name (shown on leaderboard)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={32}
              autoComplete="name"
              required
              style={inputStyle}
            />
            {displayName.trim().length >= 2 && (
              <div style={{ fontSize: "11px", color: C.secondary, fontFamily: C.mono, marginTop: "3px", paddingLeft: "2px" }}>
                Shown as: <span style={{ color: C.primary, fontWeight: 600 }}>{sanitizeDisplayName(displayName) || "—"}</span>
              </div>
            )}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={inputStyle}
        />

        {/* Password — not shown on forgot */}
        {authMode !== "forgot" && (
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              style={{ ...inputStyle, paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: C.secondary,
                fontSize: "13px", fontFamily: C.font, padding: "2px",
              }}
            >
              {showPassword ? "hide" : "show"}
            </button>
            {authMode === "signup" && <PasswordStrengthBar password={password} />}
          </div>
        )}

        {/* Confirm password — sign up only */}
        {authMode === "signup" && (
          <div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              style={{
                ...inputStyle,
                borderColor: confirm && confirm !== password ? "#ef4444" : C.border,
              }}
            />
            {confirm && confirm !== password && (
              <div style={{ fontSize: "11px", color: "#ef4444", fontFamily: C.mono, marginTop: "3px", paddingLeft: "2px" }}>
                Passwords don't match
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={authLoading}
          style={{
            width: "100%", height: "44px",
            background: authMode === "signin" ? "var(--ps-amber)" : C.mint,
            color: "#000",
            border: "none", borderRadius: "8px",
            fontSize: "14px", fontWeight: 700,
            cursor: authLoading ? "not-allowed" : "pointer",
            marginTop: "4px", fontFamily: C.font,
            transition: "opacity 0.15s, transform 0.1s ease",
            opacity: authLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!authLoading) e.currentTarget.style.transform = "scale(1.015)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {authLoading
            ? "…"
            : authMode === "signin"
            ? "Sign in"
            : authMode === "signup"
            ? "Create account"
            : "Send reset link"}
        </button>
      </form>

      {/* Error / info messages */}
      {error && (
        <div style={{
          color: "#ef4444", fontSize: "12px", marginTop: "10px",
          fontFamily: C.mono, background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px",
          padding: "8px 10px", lineHeight: 1.5,
        }}>
          {error}
          {error.includes("already exists") && (
            <button
              onClick={() => switchMode("signin")}
              style={{ background: "none", border: "none", color: C.mint, cursor: "pointer", fontSize: "12px", fontFamily: C.mono, padding: 0, marginLeft: "6px", textDecoration: "underline" }}
            >
              Sign in →
            </button>
          )}
        </div>
      )}
      {info && (
        <div style={{
          color: C.mint, fontSize: "12px", marginTop: "10px",
          fontFamily: C.mono, background: "rgba(14,167,154,0.08)",
          border: "1px solid rgba(14,167,154,0.2)", borderRadius: "6px",
          padding: "8px 10px", lineHeight: 1.5,
        }}>
          {info}
        </div>
      )}

      {/* Mode switchers */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
        {authMode !== "forgot" && (
          <button
            onClick={() => switchMode(authMode === "signin" ? "signup" : "signin")}
            style={{ background: "none", border: "none", color: C.secondary, fontSize: "12px", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: C.font }}
          >
            {authMode === "signin" ? "No account? Sign up →" : "Already have an account? Sign in"}
          </button>
        )}
        {authMode === "signin" && (
          <button
            onClick={() => switchMode("forgot")}
            style={{ background: "none", border: "none", color: C.secondary, fontSize: "12px", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: C.font }}
          >
            Forgot password?
          </button>
        )}
        {authMode === "forgot" && (
          <button
            onClick={() => switchMode("signin")}
            style={{ background: "none", border: "none", color: C.secondary, fontSize: "12px", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: C.font }}
          >
            ← Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}
