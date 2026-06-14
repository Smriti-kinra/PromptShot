import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export function AnimatedGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle pool representing eco/water drops drifting
    const particles: Particle[] = [];
    const maxParticles = 35;

    const createParticle = (x: number, y: number, randomLife = false): Particle => {
      const maxLife = 120 + Math.random() * 120;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.25 - Math.random() * 0.4,
        size: 0.8 + Math.random() * 1.8,
        opacity: Math.random() * 0.35 + 0.05,
        life: randomLife ? Math.floor(Math.random() * maxLife * 0.8) : 0,
        maxLife,
      };
    };

    // Pre-populate particles randomly across the screen
    for (let i = 0; i < maxParticles; i++) {
      particles.push(
        createParticle(
          Math.random() * width,
          Math.random() * height,
          true
        )
      );
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Tech Grid
      const gridSize = 48;
      const mouse = mouseRef.current;

      ctx.strokeStyle = "rgba(36, 59, 39, 0.12)";
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Spotlight Highlight at Cursor Intersection
      if (mouse.active) {
        // Draw soft radial highlight behind
        const radGradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          160
        );
        radGradient.addColorStop(0, "rgba(20, 184, 166, 0.10)");
        radGradient.addColorStop(0.6, "rgba(110, 224, 155, 0.02)");
        radGradient.addColorStop(1, "rgba(11, 22, 16, 0)");

        ctx.fillStyle = radGradient;
        ctx.fillRect(0, 0, width, height);

        // Calculate nearest grid intersection coordinate
        const nearestX = Math.round(mouse.x / gridSize) * gridSize;
        const nearestY = Math.round(mouse.y / gridSize) * gridSize;

        // Draw crosshair dot & ring
        ctx.strokeStyle = "rgba(20, 184, 166, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nearestX, nearestY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(20, 184, 166, 0.3)";
        ctx.fill();
        ctx.stroke();

        // Draw dynamic grid hover lines fragments
        ctx.beginPath();
        ctx.moveTo(nearestX - 16, nearestY);
        ctx.lineTo(nearestX + 16, nearestY);
        ctx.moveTo(nearestX, nearestY - 16);
        ctx.lineTo(nearestX, nearestY + 16);
        ctx.stroke();
      }

      // 3. Draw and Update Drifting Eco-particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Reset if expired or out of bounds
        if (p.life >= p.maxLife || p.y < 0 || p.x < 0 || p.x > width) {
          particles[i] = createParticle(Math.random() * width, height + 10);
          continue;
        }

        const lifeRatio = p.life / p.maxLife;
        const opacity = p.opacity * Math.sin(lifeRatio * Math.PI);

        ctx.fillStyle = `rgba(110, 224, 155, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
