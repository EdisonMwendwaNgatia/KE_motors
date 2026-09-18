'use client';

import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Car detail loading screen:
   - Mobile (< sm): Simple 3 dots animation on clean white background
   - Desktop (>= sm): BMW Dual Instrument Cluster over Porsche Hero Background
───────────────────────────────────────────────────────────────────────────── */

export default function LoadingCarDetail() {
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(800);
  const [gear, setGear] = useState('D1');

  useEffect(() => {
    let animationFrameId: number;
    let pulseInterval: NodeJS.Timeout;
    const startTime = performance.now();
    const duration = 5500; // 5.5s smooth acceleration

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let currentSpeed = 0;
      let currentRpm = 800;
      let currentGear = 'D1';

      if (progress < 0.30) {
        // D1: 0 -> 32 km/h
        const p = progress / 0.30;
        const ease = Math.pow(p, 1.2);
        currentSpeed = ease * 32;
        currentRpm = 800 + ease * 2000;
        currentGear = 'D1';
      } else if (progress < 0.65) {
        // D2: 32 -> 65 km/h
        const p = (progress - 0.30) / 0.35;
        const ease = Math.pow(p, 1.1);
        currentSpeed = 32 + ease * 33;
        currentRpm = 1600 + ease * 1400;
        currentGear = 'D2';
      } else {
        // D3: 65 -> 85 km/h (Cruise)
        const p = (progress - 0.65) / 0.35;
        const ease = 1 - Math.pow(1 - p, 2);
        currentSpeed = 65 + ease * 20;
        currentRpm = 1800 + ease * 350;
        currentGear = 'D3';
      }

      setSpeed(Math.round(currentSpeed));
      setRpm(Math.round(currentRpm));
      setGear(currentGear);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        let t = 0;
        pulseInterval = setInterval(() => {
          t += 0.08;
          const speedJitter = Math.sin(t * 2) * 0.8;
          const rpmJitter = Math.sin(t * 2.5) * 25;
          setSpeed(Math.round(85 + speedJitter));
          setRpm(Math.round(2150 + rpmJitter));
        }, 60);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (pulseInterval) clearInterval(pulseInterval);
    };
  }, []);

  // Gauge angles (-135deg to +135deg = 270deg arc)
  const maxSpeed = 260;
  const clampedSpeed = Math.min(Math.max(speed, 0), maxSpeed);
  const speedNeedleAngle = -135 + (clampedSpeed / maxSpeed) * 270;

  const maxRpm = 8000;
  const clampedRpm = Math.min(Math.max(rpm, 0), maxRpm);
  const rpmNeedleAngle = -135 + (clampedRpm / maxRpm) * 270;

  // Arc stroke dash (radius 88px, 270deg length = 414.69px)
  const arcLength = 414.69;
  const speedArcOffset = arcLength * (1 - clampedSpeed / maxSpeed);
  const rpmArcOffset = arcLength * (1 - clampedRpm / maxRpm);

  return (
    <>
      {/* ── MOBILE LOADING SCREEN (< sm): Simple 3 Dots on White Background ── */}
      <div className="flex sm:hidden fixed inset-0 z-[9999] bg-white flex-col items-center justify-center space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-bounce" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading...
        </span>
      </div>

      {/* ── DESKTOP LOADING SCREEN (>= sm): Porsche Backdrop + BMW Gauges ── */}
      <div
        className="hidden sm:flex fixed inset-0 z-[9999] bg-[#07080e] flex-col items-center justify-center font-sans overflow-hidden"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

          @keyframes porsche-bg-zoom {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          @keyframes speed-streak-left {
            0% { transform: translateX(-100vw) scaleX(0.2); opacity: 0; }
            30% { opacity: 0.9; }
            100% { transform: translateX(100vw) scaleX(2.5); opacity: 0; }
          }

          @keyframes ke-glow-pulse {
            0%, 100% { opacity: 0.45; transform: scale(0.98); }
            50%       { opacity: 0.8; transform: scale(1.04); }
          }

          @keyframes ke-needle-glow {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(230,0,0,0.85)); }
            50%       { filter: drop-shadow(0 0 14px rgba(255,40,40,1)) drop-shadow(0 0 5px #fff); }
          }

          @keyframes ke-gear-pulse {
            0% { transform: scale(0.92); opacity: 0.8; }
            50% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes ke-shimmer {
            0%   { background-position: -500px 0; }
            100% { background-position:  500px 0; }
          }

          @keyframes ke-fade-up {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .ke-porsche-bg {
            animation: porsche-bg-zoom 20s ease-in-out infinite alternate;
          }

          .ke-needle-el {
            transition: transform 0.12s cubic-bezier(0.25, 1, 0.5, 1);
            animation: ke-needle-glow 1.2s ease-in-out infinite;
          }

          .ke-ambient-bg {
            animation: ke-glow-pulse 3.5s ease-in-out infinite;
          }

          .ke-gear-badge {
            animation: ke-gear-pulse 0.4s ease-out;
          }

          .speed-light {
            position: absolute;
            height: 2px;
            border-radius: 999px;
            pointer-events: none;
          }
        `}</style>

        {/* 1. Porsche Background Image */}
        <div
          className="ke-porsche-bg"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4) contrast(1.15) saturate(1.1)',
          }}
        />

        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(8,10,18,0.72) 0%, rgba(5,6,12,0.92) 80%, rgba(3,4,8,0.98) 100%)',
            backdropFilter: 'blur(3px)',
          }}
        />

        {/* 2. Speed Light Streaks Layer */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[
            { top: '18%', color: '#ff2a4b', width: '320px', speed: '2.4s', delay: '0s' },
            { top: '28%', color: '#00d2ff', width: '450px', speed: '1.8s', delay: '0.6s' },
            { top: '42%', color: '#ffaa00', width: '280px', speed: '2.8s', delay: '1.2s' },
            { top: '56%', color: '#ffffff', width: '500px', speed: '2.1s', delay: '0.3s' },
            { top: '68%', color: '#ff2a4b', width: '380px', speed: '1.9s', delay: '0.9s' },
            { top: '80%', color: '#00d2ff', width: '420px', speed: '2.6s', delay: '1.5s' },
          ].map((trail, i) => (
            <div
              key={i}
              className="speed-light"
              style={{
                top: trail.top,
                width: trail.width,
                background: `linear-gradient(90deg, transparent 0%, ${trail.color} 50%, #ffffff 90%, transparent 100%)`,
                boxShadow: `0 0 14px ${trail.color}, 0 0 4px #ffffff`,
                animation: `speed-streak-left ${trail.speed} linear ${trail.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* 3. Soft Ambient Glow */}
        <div
          className="ke-ambient-bg"
          style={{
            position: 'absolute',
            width: 700,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(255,42,75,0.14) 0%, rgba(0,162,255,0.08) 50%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        {/* 4. Header Badge */}
        <div
          style={{
            marginBottom: 20,
            animation: 'ke-fade-up 0.5s ease forwards',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 2.5, height: 14, alignItems: 'center' }}>
            <div style={{ width: 4, height: 14, borderRadius: 1, background: '#0066B1' }} />
            <div style={{ width: 4, height: 14, borderRadius: 1, background: '#001E50' }} />
            <div style={{ width: 4, height: 14, borderRadius: 1, background: '#E40521' }} />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#ffffff',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            KE MOTORS <span style={{ color: '#ff3344', fontWeight: 900 }}>DIGITAL CLUSTER</span>
          </span>
        </div>

        {/* Dual Gauges Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap',
            animation: 'ke-fade-up 0.6s ease forwards',
            zIndex: 10,
          }}
        >
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <radialGradient id="bmw-bezel-g" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2c2d3a" />
                <stop offset="85%" stopColor="#151620" />
                <stop offset="100%" stopColor="#090a10" />
              </radialGradient>
              <radialGradient id="bmw-face-g" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1c1e2d" />
                <stop offset="70%" stopColor="#0f101b" />
                <stop offset="100%" stopColor="#080811" />
              </radialGradient>
              <linearGradient id="bmw-speed-arc" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cc0000" />
                <stop offset="60%" stopColor="#ff3333" />
                <stop offset="85%" stopColor="#ffaa00" />
                <stop offset="100%" stopColor="#ff5500" />
              </linearGradient>
              <linearGradient id="bmw-rpm-arc" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0066b1" />
                <stop offset="60%" stopColor="#00a2ff" />
                <stop offset="82%" stopColor="#ffaa00" />
                <stop offset="100%" stopColor="#ff1e43" />
              </linearGradient>
              <linearGradient id="bmw-needle-g" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#ff2222" />
                <stop offset="100%" stopColor="#880000" />
              </linearGradient>
              <radialGradient id="bmw-glass-g" cx="38%" cy="26%" r="58%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </radialGradient>
              <filter id="glow-strong-g">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-soft-g">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Speedometer (Left) */}
          <div
            style={{
              position: 'relative',
              width: 240,
              height: 240,
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.6))',
            }}
          >
            <svg viewBox="0 0 200 200" width="240" height="240">
              <circle cx="100" cy="100" r="98" fill="url(#bmw-bezel-g)" />
              <circle cx="100" cy="100" r="98" fill="none" stroke="#36374a" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="#1f202e" strokeWidth="1" />
              <circle cx="100" cy="100" r="88" fill="url(#bmw-face-g)" />

              <path d="M22 158 A88 88 0 1 1 178 158" fill="none" stroke="#151626" strokeWidth="8" strokeLinecap="round" />

              <path
                d="M22 158 A88 88 0 1 1 178 158"
                fill="none"
                stroke="url(#bmw-speed-arc)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={speedArcOffset}
                filter="url(#glow-soft-g)"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />

              {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260].map((val) => {
                const angle = -135 + (val / 260) * 270;
                const rad = (angle * Math.PI) / 180;
                const isRed = val >= 220;
                return (
                  <line
                    key={val}
                    x1={100 + 82 * Math.cos(rad)}
                    y1={100 + 82 * Math.sin(rad)}
                    x2={100 + 69 * Math.cos(rad)}
                    y2={100 + 69 * Math.sin(rad)}
                    stroke={isRed ? '#ff2a4b' : '#d0d4e4'}
                    strokeWidth={isRed ? 2.5 : 2}
                    strokeLinecap="round"
                    opacity={isRed ? 1 : 0.85}
                  />
                );
              })}

              {Array.from({ length: 53 }).map((_, i) => {
                if (i % 4 === 0) return null;
                const angle = -135 + (i / 52) * 270;
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={100 + 82 * Math.cos(rad)}
                    y1={100 + 82 * Math.sin(rad)}
                    x2={100 + 76 * Math.cos(rad)}
                    y2={100 + 76 * Math.sin(rad)}
                    stroke="#2d3045"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                );
              })}

              {[0, 40, 80, 120, 160, 200, 240].map((val) => {
                const angle = -135 + (val / 260) * 270;
                const rad = (angle * Math.PI) / 180;
                const isRed = val >= 220;
                return (
                  <text
                    key={val}
                    x={100 + 57 * Math.cos(rad)}
                    y={100 + 57 * Math.sin(rad) + 3.5}
                    textAnchor="middle"
                    fontSize="7.5"
                    fontWeight="700"
                    fill={isRed ? '#ff3a55' : '#6b7280'}
                    fontFamily="'Inter', sans-serif"
                  >
                    {val}
                  </text>
                );
              })}

              <circle cx="100" cy="100" r="46" fill="none" stroke="#1d2033" strokeWidth="1" />

              <text
                x="100"
                y="97"
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fill="#ffffff"
                fontFamily="'Inter', sans-serif"
                filter="url(#glow-soft-g)"
              >
                {speed}
              </text>

              <text
                x="100"
                y="112"
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="800"
                fill="#cc0000"
                letterSpacing="0.22em"
                fontFamily="'Inter', sans-serif"
              >
                KM/H
              </text>

              <text
                x="100"
                y="126"
                textAnchor="middle"
                fontSize="6"
                fontWeight="700"
                fill="#9ca3af"
                letterSpacing="0.1em"
                fontFamily="'Inter', sans-serif"
              >
                SPEED
              </text>

              <g
                className="ke-needle-el"
                style={{
                  transform: `rotate(${speedNeedleAngle}deg)`,
                  transformOrigin: '100px 116px',
                }}
              >
                <polygon points="98,34 102,34 101.2,116 98.8,116" fill="url(#bmw-needle-g)" filter="url(#glow-strong-g)" />
                <circle cx="100" cy="38" r="2.2" fill="#ffffff" filter="url(#glow-strong-g)" />
              </g>

              <circle cx="100" cy="116" r="11" fill="#0f101a" stroke="#222538" strokeWidth="2" />
              <circle cx="100" cy="116" r="6" fill="#cc0000" filter="url(#glow-soft-g)" />
              <circle cx="100" cy="116" r="2.5" fill="#ffffff" />
              <circle cx="100" cy="100" r="88" fill="url(#bmw-glass-g)" pointerEvents="none" />
            </svg>
          </div>

          {/* Center Gear Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 18px',
              background: 'rgba(10, 12, 22, 0.88)',
              backdropFilter: 'blur(8px)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              minWidth: 96,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#9ca3af',
              }}
            >
              GEAR
            </span>

            <div
              key={gear}
              className="ke-gear-badge"
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: '#0066B1',
                boxShadow: '0 0 16px rgba(0,102,177,0.7)',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: '0.08em',
                textAlign: 'center',
              }}
            >
              {gear}
            </div>

            <span
              style={{
                fontSize: 7.5,
                fontWeight: 700,
                color: '#60a5fa',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              CRUISE
            </span>
          </div>

          {/* Tachometer / RPM (Right) */}
          <div
            style={{
              position: 'relative',
              width: 240,
              height: 240,
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.6))',
            }}
          >
            <svg viewBox="0 0 200 200" width="240" height="240">
              <circle cx="100" cy="100" r="98" fill="url(#bmw-bezel-g)" />
              <circle cx="100" cy="100" r="98" fill="none" stroke="#36374a" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="#1f202e" strokeWidth="1" />
              <circle cx="100" cy="100" r="88" fill="url(#bmw-face-g)" />

              <path d="M22 158 A88 88 0 1 1 178 158" fill="none" stroke="#151626" strokeWidth="8" strokeLinecap="round" />

              <path
                d="M22 158 A88 88 0 1 1 178 158"
                fill="none"
                stroke="url(#bmw-rpm-arc)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={rpmArcOffset}
                filter="url(#glow-soft-g)"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />

              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((val) => {
                const angle = -135 + (val / 8) * 270;
                const rad = (angle * Math.PI) / 180;
                const isRedline = val >= 6;
                return (
                  <line
                    key={val}
                    x1={100 + 82 * Math.cos(rad)}
                    y1={100 + 82 * Math.sin(rad)}
                    x2={100 + 69 * Math.cos(rad)}
                    y2={100 + 69 * Math.sin(rad)}
                    stroke={isRedline ? '#ff2a4b' : '#d0d4e4'}
                    strokeWidth={isRedline ? 2.8 : 2}
                    strokeLinecap="round"
                    opacity={isRedline ? 1 : 0.85}
                  />
                );
              })}

              {Array.from({ length: 33 }).map((_, i) => {
                if (i % 4 === 0) return null;
                const angle = -135 + (i / 32) * 270;
                const rad = (angle * Math.PI) / 180;
                const isRed = i >= 24;
                return (
                  <line
                    key={i}
                    x1={100 + 82 * Math.cos(rad)}
                    y1={100 + 82 * Math.sin(rad)}
                    x2={100 + 76 * Math.cos(rad)}
                    y2={100 + 76 * Math.sin(rad)}
                    stroke={isRed ? '#ff2a4b' : '#2d3045'}
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                );
              })}

              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((val) => {
                const angle = -135 + (val / 8) * 270;
                const rad = (angle * Math.PI) / 180;
                const isRed = val >= 6;
                return (
                  <text
                    key={val}
                    x={100 + 57 * Math.cos(rad)}
                    y={100 + 57 * Math.sin(rad) + 3.5}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    fill={isRed ? '#ff3a55' : '#6b7280'}
                    fontFamily="'Inter', sans-serif"
                  >
                    {val}
                  </text>
                );
              })}

              <circle cx="100" cy="100" r="46" fill="none" stroke="#1d2033" strokeWidth="1" />

              <text
                x="100"
                y="97"
                textAnchor="middle"
                fontSize="22"
                fontWeight="900"
                fill="#ffffff"
                fontFamily="'Inter', sans-serif"
                filter="url(#glow-soft-g)"
              >
                {rpm}
              </text>

              <text
                x="100"
                y="112"
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="800"
                fill="#0066b1"
                letterSpacing="0.22em"
                fontFamily="'Inter', sans-serif"
              >
                RPM
              </text>

              <text
                x="100"
                y="126"
                textAnchor="middle"
                fontSize="5.5"
                fontWeight="700"
                fill="#9ca3af"
                letterSpacing="0.1em"
                fontFamily="'Inter', sans-serif"
              >
                1/MIN x1000
              </text>

              <g
                className="ke-needle-el"
                style={{
                  transform: `rotate(${rpmNeedleAngle}deg)`,
                  transformOrigin: '100px 116px',
                }}
              >
                <polygon points="98,34 102,34 101.2,116 98.8,116" fill="url(#bmw-needle-g)" filter="url(#glow-strong-g)" />
                <circle cx="100" cy="38" r="2.2" fill="#ffffff" filter="url(#glow-strong-g)" />
              </g>

              <circle cx="100" cy="116" r="11" fill="#0f101a" stroke="#222538" strokeWidth="2" />
              <circle cx="100" cy="116" r="6" fill="#0066b1" filter="url(#glow-soft-g)" />
              <circle cx="100" cy="116" r="2.5" fill="#ffffff" />
              <circle cx="100" cy="100" r="88" fill="url(#bmw-glass-g)" pointerEvents="none" />
            </svg>
          </div>
        </div>

        {/* Status Message */}
        <div
          style={{
            marginTop: 26,
            animation: 'ke-fade-up 0.7s 0.15s ease both',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            Loading Vehicle Details
          </p>
          <p
            style={{
              margin: '5px 0 0',
              fontSize: 12,
              color: '#9ca3af',
              fontWeight: 500,
            }}
          >
            Mode {gear} • {speed} km/h • {rpm} RPM
          </p>
        </div>

        {/* Shimmer Progress Bar */}
        <div
          style={{
            marginTop: 16,
            width: 260,
            height: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.15)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 3,
              backgroundImage:
                'linear-gradient(90deg, transparent 0%, #ff2a4b 35%, #00d2ff 50%, #ff2a4b 65%, transparent 100%)',
              backgroundSize: '500px 100%',
              animation: 'ke-shimmer 1.4s linear infinite',
            }}
          />
        </div>
      </div>
    </>
  );
}
