import React, { useEffect, useRef } from "react";

const GlobeAnimation = ({ isSpeaking }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    const particleCount = 250; 
    const baseRadius = 130; // Thoda adjust kiya size modal ke liye
    const connectionDistance = 55; 
    let currentPulseScale = 1;
    const particles = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      particles.push({
        x: x * baseRadius,
        y: y * baseRadius,
        z: z * baseRadius,
        originalX: x * baseRadius,
        originalY: y * baseRadius,
        originalZ: z * baseRadius,
        projected: { x: 0, y: 0, scale: 1 }
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const targetSpeed = isSpeaking ? 0.025 : 0.005;
      const targetPulse = isSpeaking ? 1.1 : 1.0;
      const wobbleIntensity = isSpeaking ? 12 : 3; 
      
      currentPulseScale += (targetPulse - currentPulseScale) * 0.08;
      time += targetSpeed;

      particles.forEach((p) => {
        const cosT = Math.cos(time);
        const sinT = Math.sin(time);
        let x = p.originalX * cosT - p.originalZ * sinT;
        let z = p.originalX * sinT + p.originalZ * cosT;
        let y = p.originalY;

        const distortion = Math.cos(time * 0.8 + y * 0.03) * wobbleIntensity;
        x += distortion;
        
        // Tilt logic
        const tiltAngle = 0.2; 
        let yTilt = y * Math.cos(tiltAngle) - z * Math.sin(tiltAngle);
        let zTilt = y * Math.sin(tiltAngle) + z * Math.cos(tiltAngle);
        y = yTilt;
        z = zTilt;

        x *= currentPulseScale;
        y *= currentPulseScale;
        z *= currentPulseScale;

        const perspective = 400; 
        const scale = perspective / (perspective + z);
        
        p.projected.x = cx + x * scale;
        p.projected.y = cy + y * scale;
        p.projected.scale = scale;
        p.projected.z = z;
      });

      // --- PURPLE COLOR LOGIC ---
      // Idle: Deep Purple | Speaking: Bright Violet/Magenta
      const lineRgb = isSpeaking ? "168, 85, 247" : "107, 33, 168"; // Purple-500 vs Purple-800
      const dotColorStart = isSpeaking ? "#d8b4fe" : "#7e22ce"; // Light Purple vs Dark Purple

      ctx.lineWidth = isSpeaking ? 1.5 : 0.5;
      
      for (let i = 0; i < particleCount; i++) {
        const checkRange = 30; 
        const startCheck = Math.max(0, i - checkRange);
        for (let j = startCheck; j < i; j++) {
             const p1 = particles[i];
             const p2 = particles[j];
             const dx = p1.projected.x - p2.projected.x;
             const dy = p1.projected.y - p2.projected.y;
             const distSq = dx * dx + dy * dy;

             if (distSq < connectionDistance * connectionDistance) {
               const opacity = (1 - Math.sqrt(distSq) / connectionDistance) * 0.6;
               const depthAlpha = (p1.projected.scale + p2.projected.scale) / 2;
               if (opacity > 0) {
                 ctx.beginPath();
                 ctx.strokeStyle = `rgba(${lineRgb}, ${opacity * depthAlpha})`;
                 ctx.moveTo(p1.projected.x, p1.projected.y);
                 ctx.lineTo(p2.projected.x, p2.projected.y);
                 ctx.stroke();
               }
             }
        }
      }

      particles.forEach((p) => {
        const size = (isSpeaking ? 3 : 2) * p.projected.scale; 
        if (size < 0.5) return;
        const alpha = Math.min(1, Math.max(0.1, p.projected.scale * 1.5)); 

        ctx.beginPath();
        ctx.arc(p.projected.x, p.projected.y, size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            p.projected.x, p.projected.y, 0,
            p.projected.x, p.projected.y, size * 2
        );
        gradient.addColorStop(0, dotColorStart);
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    canvas.width = 500;
    canvas.height = 500;
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: "100%", 
        height: "auto",
        maxWidth: "400px", 
        aspectRatio: "1/1",
      }} 
    />
  );
};

export default GlobeAnimation;