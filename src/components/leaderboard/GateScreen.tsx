import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { C } from "./constants";

interface GateScreenProps {
  onClose: () => void;
}

export function GateScreen({ onClose }: GateScreenProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (authMode === "signup" && !displayName.trim()) {
      setError("Please enter a display name.");
      return;
    }
    if (authMode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setAuthLoading(true);
    if (authMode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else onClose();
    } else {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
      });
      if (err) setError(err.message);
      else setInfo("Check your email to confirm your account.");
    }
    setAuthLoading(false);
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Trophy graphic */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(245, 197, 24, 0.1)",
          border: `2px solid rgba(245, 197, 24, 0.25)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: "32px",
        }}>
          🏆
        </div>
        <div style={{
          fontSize: "20px",
          fontWeight: 700,
          color: C.primary,
          fontFamily: C.font,
          marginBottom: "8px",
          lineHeight: 1.2,
        }}>
          See where you rank
        </div>
        <div style={{
          fontSize: "13px",
          color: C.secondary,
          fontFamily: C.font,
          lineHeight: 1.5,
          maxWidth: "260px",
          margin: "0 auto",
        }}>
          Your score is saved locally. Sign in to appear on the leaderboard and compare with others.
        </div>
      </div>

      <div style={{ height: "1px", background: C.border, margin: "20px 0" }} />

      <div style={{ fontSize: "13px", fontWeight: 600, color: C.primary, marginBottom: "14px", fontFamily: C.font }}>
        {authMode === "signin" ? "Sign in to continue" : "Create account"}
      </div>

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {authMode === "signup" && (
          <input
            type="text"
            placeholder="Your name (shown on leaderboard)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={32}
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {authMode === "signup" && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />
        )}
        <button
          type="submit"
          disabled={authLoading}
          style={{
            width: "100%",
            height: "44px",
            background: C.mint,
            color: "#0B1610",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: authLoading ? "not-allowed" : "pointer",
            marginTop: "4px",
            fontFamily: C.font,
            transition: "opacity 0.15s",
            opacity: authLoading ? 0.6 : 1,
          }}
        >
          {authLoading ? "…" : authMode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {error && (
        <div style={{ color: C.red, fontSize: "12px", marginTop: "10px", fontFamily: C.mono }}>
          {error}
        </div>
      )}
      {info && (
        <div style={{ color: C.mint, fontSize: "12px", marginTop: "10px", fontFamily: C.mono }}>
          {info}
        </div>
      )}

      <button
        onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
        style={{
          background: "none",
          border: "none",
          color: C.secondary,
          fontSize: "12px",
          cursor: "pointer",
          padding: 0,
          marginTop: "16px",
          display: "block",
          fontFamily: C.font,
        }}
      >
        {authMode === "signin" ? "No account? Sign up →" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
