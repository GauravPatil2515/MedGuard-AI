import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function MolecularAnimation({
  isInferenceRunning = false,
  moleculeName = "Warfarin • Amiodarone Complex"
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const anglesRef = useRef({ rotX: 0.35, rotY: 0.6 });

  // 3D Atoms with spatial coordinates, realistic atomic radii, and biomedical colors
  const atoms = [
    // Warfarin Core Coumarin System
    { x: -55, y: -20, z: 0, color: '#334155', r: 8.5, label: 'C' },
    { x: -30, y: -42, z: 12, color: '#334155', r: 8.5, label: 'C' },
    { x: 10,  y: -35, z: 18, color: '#334155', r: 8.5, label: 'C' },
    { x: 28,  y: -8,  z: 10, color: '#16a34a', r: 9.5, label: 'C*' }, // Active hERG affinity binding locus
    { x: 5,   y: 14,  z: -6, color: '#334155', r: 8.5, label: 'C' },
    { x: -38, y: 8,   z: -12, color: '#334155', r: 8.5, label: 'C' },
    // Carbonyl & Hydroxyl Oxygens
    { x: 58,  y: 6,   z: 8,  color: '#dc2626', r: 8.5, label: 'O' },
    { x: -70, y: -28, z: -4, color: '#dc2626', r: 8.5, label: 'O' },
    // Phenyl substituent
    { x: 42,  y: 44,  z: -16, color: '#334155', r: 8, label: 'C' },
    { x: 22,  y: 64,  z: -8, color: '#334155', r: 8, label: 'C' },
    { x: -14, y: 56,  z: 12, color: '#334155', r: 8, label: 'C' },
    // Amiodarone interaction site (iodine & amine cluster)
    { x: 78,  y: -28, z: 24, color: '#7c3aed', r: 10.5, label: 'I' }, // Iodine (heavy halogen)
    { x: -62, y: 32,  z: -22, color: '#2563eb', r: 7.5, label: 'N' },
    { x: 92,  y: 22,  z: -10, color: '#7c3aed', r: 10.5, label: 'I' }  // Secondary iodine
  ];

  // Chemical valence bonds
  const bonds = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [3, 6], [0, 7], [4, 8], [8, 9], [9, 10], [10, 4],
    [2, 11], [5, 12], [6, 13]
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let pulsePhase = 0;

    // Handle high-DPI Retina screens and responsive container resizing
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const render = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Inertia & Auto-rotation
      if (!isDraggingRef.current) {
        // Damping of manual spin velocity
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        anglesRef.current.rotY += velocityRef.current.x + 0.007;
        anglesRef.current.rotX += velocityRef.current.y + 0.0025;
      }
      pulsePhase += 0.04;

      const cx = width / 2;
      const cy = height / 2;
      const fov = 300;

      // Responsive model scale
      const modelScale = Math.min(width, height) / 220;

      const { rotX, rotY } = anglesRef.current;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      // 3D coordinate transformation and perspective projection
      const projected = atoms.map(atom => {
        // Yaw (Y axis rotation)
        const x1 = atom.x * cosY - atom.z * sinY;
        const z1 = atom.x * sinY + atom.z * cosY;
        // Pitch (X axis rotation)
        const y2 = atom.y * cosX - z1 * sinX;
        const z2 = atom.y * sinX + z1 * cosX;

        const scale = fov / (fov + z2 + 80);
        return {
          px: cx + x1 * scale * modelScale,
          py: cy + y2 * scale * modelScale,
          pz: z2,
          radius: Math.max(3, atom.r * scale * (modelScale * 0.9)),
          color: atom.color,
          label: atom.label
        };
      });

      // 1. Draw 3D Chemical Bonds with depth attenuation
      bonds.forEach(([i, j]) => {
        const a1 = projected[i];
        const a2 = projected[j];

        // Depth fogging
        const avgZ = (a1.pz + a2.pz) / 2;
        const alpha = Math.max(0.2, Math.min(0.85, (avgZ + 90) / 160));

        ctx.beginPath();
        ctx.moveTo(a1.px, a1.py);
        ctx.lineTo(a2.px, a2.py);
        ctx.strokeStyle = isInferenceRunning 
          ? `rgba(22, 163, 74, ${alpha * 0.9})` 
          : `rgba(148, 163, 184, ${alpha * 0.55})`;
        ctx.lineWidth = Math.max(1.5, 2.8 * (avgZ > 0 ? 1.15 : 0.85));
        ctx.lineCap = 'round';
        ctx.stroke();

        // GNN Message passing inference wave
        if (isInferenceRunning) {
          const t = (Math.sin(pulsePhase * 1.5 + i * 0.8) + 1) / 2;
          const px = a1.px + (a2.px - a1.px) * t;
          const py = a1.py + (a2.py - a1.py) * t;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 2. Sort atoms back-to-front (Painter's algorithm)
      const sorted = projected.slice().sort((a, b) => a.pz - b.pz);

      // 3. Draw Realistic 3D Atoms with specular highlights
      sorted.forEach(atom => {
        // Specular 3D spherical gradient
        const lightX = atom.px - atom.radius * 0.35;
        const lightY = atom.py - atom.radius * 0.35;
        
        const grad = ctx.createRadialGradient(
          lightX, lightY, atom.radius * 0.1,
          atom.px, atom.py, atom.radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, atom.color);
        grad.addColorStop(0.85, atom.color);
        grad.addColorStop(1, '#020617');

        // Drop shadow for front atoms
        if (atom.pz > 10) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;
        } else {
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
        }

        ctx.beginPath();
        ctx.arc(atom.px, atom.py, atom.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Subtle glow ring on active GNN target node
        if (atom.label === 'C*') {
          ctx.beginPath();
          ctx.arc(atom.px, atom.py, atom.radius + 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.85)';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isInferenceRunning]);

  // Touch and Mouse Orbit Handlers
  const handlePointerStart = (clientX, clientY) => {
    isDraggingRef.current = true;
    lastPointerRef.current = { x: clientX, y: clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - lastPointerRef.current.x;
    const dy = clientY - lastPointerRef.current.y;

    velocityRef.current = {
      x: dx * 0.008,
      y: dy * 0.008
    };

    anglesRef.current.rotY += dx * 0.012;
    anglesRef.current.rotX += dy * 0.012;
    lastPointerRef.current = { x: clientX, y: clientY };
  };

  const handlePointerEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '240px',
        minHeight: '220px',
        background: 'radial-gradient(ellipse at 50% 50%, #ffffff 0%, #f6f8f6 100%)',
        border: '1px solid var(--mg-card-border)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none'
      }}
      onMouseDown={(e) => handlePointerStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerEnd}
      onMouseLeave={handlePointerEnd}
      onTouchStart={(e) => {
        if (e.touches[0]) handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handlePointerEnd}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {/* Floating 3D Metadata Chips */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--mg-text-main)',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(6px)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--mg-card-border)'
        }}>
          {moleculeName}
        </span>
      </div>

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '12px',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: 'var(--mg-text-muted)',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(6px)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--mg-card-border)',
        pointerEvents: 'none'
      }}>
        Touch / drag to rotate 3D
      </div>
    </div>
  );
}
