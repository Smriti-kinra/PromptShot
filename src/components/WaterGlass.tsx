import { useState, useEffect } from "react";

export function WaterGlass({ waterMl }: { waterMl: number }) {
  const [fillPct, setFillPct] = useState(0);
  const glassW = 72;
  const glassH = 120;

  useEffect(() => {
    const timer = setTimeout(() => {
      const target = Math.min(90, Math.max(18, (waterMl / 35) * 100));
      setFillPct(target);
    }, 300);
    return () => clearTimeout(timer);
  }, [waterMl]);

  const fillY = glassH - (glassH * fillPct) / 100;
  const waveWidth = glassW * 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg
        width={glassW}
        height={glassH}
        viewBox={`0 0 ${glassW} ${glassH}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <style>{`
            @keyframes wave-move {
              0%   { transform: translateX(0); }
              50%  { transform: translateX(-${glassW}px); }
              100% { transform: translateX(0); }
            }
            @keyframes wave-move2 {
              0%   { transform: translateX(-${glassW * 0.5}px); }
              50%  { transform: translateX(${glassW * 0.5}px); }
              100% { transform: translateX(-${glassW * 0.5}px); }
            }
            @keyframes fill-rise {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>

          <clipPath id="glass-clip">
            <path d={`
              M 4 0
              L ${glassW - 4} 0
              L ${glassW - 2} ${glassH - 14}
              Q ${glassW - 2} ${glassH} ${glassW - 14} ${glassH}
              L 14 ${glassH}
              Q 2 ${glassH} 2 ${glassH - 14}
              Z
            `} />
          </clipPath>
        </defs>

        {/* Glass body (frosted outline) */}
        <path
          d={`
            M 4 0
            L ${glassW - 4} 0
            L ${glassW - 2} ${glassH - 14}
            Q ${glassW - 2} ${glassH} ${glassW - 14} ${glassH}
            L 14 ${glassH}
            Q 2 ${glassH} 2 ${glassH - 14}
            Z
          `}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* Water fill group */}
        <g clipPath="url(#glass-clip)">
          <rect
            x={0}
            y={fillY + 8}
            width={glassW}
            height={glassH - fillY}
            fill="#14B8A6"
            style={{ transition: "y 2.5s cubic-bezier(0.1,0.8,0.2,1)" }}
          />

          {/* Wave 1 */}
          <g style={{
            animation: "wave-move 4s ease-in-out infinite",
            transition: "transform 2.5s cubic-bezier(0.1,0.8,0.2,1)",
          }}>
            <path
              d={`
                M ${-glassW} ${fillY}
                Q ${-glassW + glassW * 0.25} ${fillY - 8} ${-glassW + glassW * 0.5} ${fillY}
                Q ${-glassW + glassW * 0.75} ${fillY + 8} ${-glassW + glassW} ${fillY}
                Q ${-glassW + glassW * 1.25} ${fillY - 8} ${-glassW + glassW * 1.5} ${fillY}
                Q ${-glassW + glassW * 1.75} ${fillY + 8} ${-glassW + glassW * 2} ${fillY}
                Q ${-glassW + glassW * 2.25} ${fillY - 8} ${-glassW + glassW * 2.5} ${fillY}
                Q ${-glassW + glassW * 2.75} ${fillY + 8} ${-glassW + glassW * 3} ${fillY}
                L ${-glassW + glassW * 3} ${glassH}
                L ${-glassW} ${glassH}
                Z
              `}
              fill="#14B8A6"
            />
          </g>

          {/* Wave 2 (depth shadow) */}
          <g style={{ animation: "wave-move2 5.5s ease-in-out infinite" }}>
            <path
              d={`
                M ${-glassW} ${fillY + 4}
                Q ${-glassW + glassW * 0.25} ${fillY - 4} ${-glassW + glassW * 0.5} ${fillY + 4}
                Q ${-glassW + glassW * 0.75} ${fillY + 12} ${-glassW + glassW} ${fillY + 4}
                Q ${-glassW + glassW * 1.25} ${fillY - 4} ${-glassW + glassW * 1.5} ${fillY + 4}
                Q ${-glassW + glassW * 1.75} ${fillY + 12} ${-glassW + glassW * 2} ${fillY + 4}
                Q ${-glassW + glassW * 2.25} ${fillY - 4} ${-glassW + glassW * 2.5} ${fillY + 4}
                Q ${-glassW + glassW * 2.75} ${fillY + 12} ${-glassW + glassW * 3} ${fillY + 4}
                L ${-glassW + glassW * 3} ${glassH}
                L ${-glassW} ${glassH}
                Z
              `}
              fill="rgba(10,30,20,0.35)"
            />
          </g>

          {/* Shimmer highlight */}
          <rect
            x={8}
            y={fillY + 6}
            width={6}
            height={glassH - fillY}
            rx={3}
            fill="rgba(255,255,255,0.08)"
          />
        </g>

        {/* Rim highlight */}
        <line x1={4} y1={1} x2={glassW - 4} y2={1} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      </svg>
    </div>
  );
}
