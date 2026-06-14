export function LoadingSkeleton() {
  return (
    <>
      <style>{`@keyframes pulse { 0%,100% { opacity:.35 } 50% { opacity:.7 } }`}</style>
      {[{ h: 80 }, { h: 160 }, { h: 48 }].map((b, i) => (
        <div
          key={i}
          style={{
            height: `${b.h}px`,
            background: "#1a1a1a",
            borderRadius: "8px",
            marginBottom: "16px",
            animation: `pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </>
  );
}
