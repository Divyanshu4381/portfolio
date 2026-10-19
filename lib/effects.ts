// Sound and Confetti effects for high-converting interactive UX

/**
 * Synthesizes a futuristic, clean success chime using Web Audio API.
 * No external audio files or network requests required.
 */
export function playSuccessChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pleasant high-tech chord (C5 -> E5 -> G5 harmonic chime)
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      // Volume envelope with gentle ramp and smooth decay
      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.5);
    });
  } catch {
    // Graceful fallback if audio is autoplay-blocked or unsupported
  }
}

/**
 * Synthesizes a gentle error tone when an action fails.
 */
export function playErrorSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Ignore error
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

/**
 * Triggers a premium, lightweight particle explosion with emerald & gold celebratory confetti.
 * Self-contained HTML5 Canvas, zero external dependencies.
 */
export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Emerald theme colors matching portfolio
  const colors = [
    "#10b981", // emerald-500
    "#34d399", // emerald-400
    "#6ee7b7", // emerald-300
    "#059669", // emerald-600
    "#fbbf24", // amber-400 (gold sparkle)
    "#ffffff", // pure white
    "#38bdf8", // sky-400
  ];

  const particles: Particle[] = [];
  const particleCount = 110;

  // Origin point near bottom-center / middle
  const originX = width / 2;
  const originY = height * 0.65;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 11;
    particles.push({
      x: originX + (Math.random() - 0.5) * 80,
      y: originY + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5, // Upward initial velocity
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      decay: 0.008 + Math.random() * 0.012,
    });
  }

  let animationFrameId: number;

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    for (const p of particles) {
      if (p.opacity <= 0) continue;
      activeParticles++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // Gravity
      p.vx *= 0.985; // Air resistance
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;

      // Draw confetti rectangle
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      ctx.restore();
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  };

  animationFrameId = requestAnimationFrame(render);

  // Fallback cleanup after 3.5 seconds
  setTimeout(() => {
    cancelAnimationFrame(animationFrameId);
    if (document.body.contains(canvas)) {
      canvas.remove();
    }
  }, 3500);
}
