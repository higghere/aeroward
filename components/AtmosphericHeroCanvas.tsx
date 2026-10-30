"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface StationNode {
  x: number;
  y: number;
  label: string;
  code: string;
  pm25: number;
  pulseRadius: number;
}

export default function AtmosphericHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Monitoring station nodes representing Kanpur sensing topology
    const stations: StationNode[] = [
      { x: 0.18, y: 0.38, label: "IIT Kanpur SuperSite", code: "IITK", pm25: 142, pulseRadius: 4 },
      { x: 0.32, y: 0.44, label: "Kalyanpur Arterial", code: "KLP", pm25: 188, pulseRadius: 5 },
      { x: 0.48, y: 0.48, label: "Rawatpur Station", code: "RWT", pm25: 196, pulseRadius: 4 },
      { x: 0.65, y: 0.52, label: "Nehru Nagar (Commercial)", code: "NHR", pm25: 238, pulseRadius: 6 },
      { x: 0.72, y: 0.64, label: "Kidwai Nagar (Residential)", code: "KDW", pm25: 182, pulseRadius: 5 },
      { x: 0.28, y: 0.68, label: "Panki Industrial Cluster", code: "PNK", pm25: 254, pulseRadius: 6 },
      { x: 0.84, y: 0.58, label: "Jajmau Leather Cluster", code: "JJM", pm25: 212, pulseRadius: 5 },
    ];

    // Atmospheric aerosol particles
    const particleCount = prefersReducedMotion ? 40 : 160;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (0.4 + Math.random() * 0.8) * 1.2, // NW advection drift
      vy: (0.1 + Math.random() * 0.3) * 0.8,
      size: 0.8 + Math.random() * 1.8,
      alpha: 0.15 + Math.random() * 0.45,
    }));

    // Mouse proximity influence
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // GSAP animated pulse for stations
    const pulseObj = { factor: 1.0, edgePhase: 0 };
    const tween = gsap.to(pulseObj, {
      factor: 1.8,
      edgePhase: Math.PI * 2,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle coordinate grid
      ctx.strokeStyle = "rgba(52, 56, 50, 0.35)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw atmospheric boundary layer cross-section line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(130, 184, 197, 0.22)"; // Muted cyan (data-weather)
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      const pblhBase = height * 0.72;
      for (let x = 0; x < width; x += 10) {
        const y = pblhBase - Math.sin((x / width) * Math.PI * 2 + time * 0.5) * 24;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Label boundary layer
      ctx.fillStyle = "rgba(130, 184, 197, 0.4)";
      ctx.font = "10px monospace";
      ctx.fillText("PLANETARY BOUNDARY LAYER HEIGHT (PBLH ~ 320m NOCTURNAL COMPRESSION)", 32, pblhBase - 32);

      // 3. Draw inter-station dynamic graph relational edges (STGNN adjacency W)
      for (let i = 0; i < stations.length; i++) {
        for (let j = i + 1; j < stations.length; j++) {
          const s1 = stations[i];
          const s2 = stations[j];
          const p1 = { x: s1.x * width, y: s1.y * height };
          const p2 = { x: s2.x * width, y: s2.y * height };
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          if (dist < width * 0.38) {
            const alpha = Math.max(0.08, (1 - dist / (width * 0.38)) * 0.28);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(199, 107, 69, ${alpha})`; // Accent rust
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 4. Update and draw aerosol particulate stream
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Mouse turbulence
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distToMouse = Math.hypot(dx, dy);
          if (distToMouse < 90) {
            const force = (1 - distToMouse / 90) * 1.5;
            p.x += (dx / distToMouse) * force;
            p.y += (dy / distToMouse) * force;
          }

          if (p.x > width + 20) p.x = -20;
          if (p.y > height + 20) p.y = -20;
        }

        ctx.fillStyle = `rgba(238, 238, 232, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw monitoring stations nodes and callout rings
      stations.forEach((s) => {
        const px = s.x * width;
        const py = s.y * height;

        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(px, py, s.pulseRadius * pulseObj.factor * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(199, 107, 69, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner solid node
        ctx.beginPath();
        ctx.arc(px, py, s.pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = s.pm25 > 200 ? "#b95342" : "#d58a50"; // severe vs high
        ctx.fill();
        ctx.strokeStyle = "#eeeee8";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Station technical readout
        ctx.fillStyle = "#eeeee8";
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText(s.code, px + 10, py - 4);
        ctx.fillStyle = "#a4a79f";
        ctx.font = "9px monospace";
        ctx.fillText(`${s.pm25} µg/m³`, px + 10, py + 8);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      tween.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-auto">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair opacity-85 transition-opacity duration-1000"
      />
      {/* Subtle bottom vignette to blend naturally into page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
      {/* Subtle top vignette */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/70 to-transparent pointer-events-none" />
    </div>
  );
}
