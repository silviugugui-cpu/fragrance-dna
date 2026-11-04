'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type ParticleType = 0 | 1 | 2; // 0=A dust, 1=B bright, 2=C hero

type Particle = {
  type: ParticleType;
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  size: number;
  baseAlpha: number;
  twinkle: number;
  twinkleSpeed: number;
  twinkleDepth: number;
  linkPulse: number;
  colorIndex: 0 | 1 | 2;
};

type Halo = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  pulseAmount: number;
  colorIndex: 0 | 1 | 2;
};

type RenderProfile = {
  minCount: number;
  maxCount: number;
  typeBRatio: number;
  typeCRatio: number;
  maxDist: number;
  linkAlphaBoost: number;
  brightLineWidth: number;
  heroLineWidth: number;
  frameIntervalMs: number;
  maxLinks: number;
  haloCount: number;
  dprCap: number;
};

const GOLD_COLORS = ['#D4AF37', '#C9A227', '#E5C76B'] as const;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export default function LuxuryAmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      return;
    }

    let rafId = 0;
    let timerId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastRenderAt = -Infinity;
    let particles: Particle[] = [];
    let halos: Halo[] = [];
    let px: number[] = [];
    let py: number[] = [];
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const narrowViewport = window.matchMedia('(max-width: 899px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shouldShow = () => !coarsePointer.matches && !narrowViewport.matches;
    const shouldAnimate = () =>
      shouldShow() && !reducedMotion.matches;

    const getRenderProfile = (): RenderProfile => {
      const connection = navigator as Navigator & { connection?: { saveData?: boolean } };
      const saveData = Boolean(connection.connection?.saveData);
      const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
      const lowPower = saveData || lowCpu || !shouldAnimate();

      return {
        minCount: 20,
        maxCount: 25,
        typeBRatio: 0.34,
        typeCRatio: 0.2,
        maxDist: 220,
        linkAlphaBoost: 0.3,
        brightLineWidth: 1.2,
        heroLineWidth: 1.7,
        frameIntervalMs: lowPower ? 1000 / 24 : 1000 / 30,
        maxLinks: 12,
        haloCount: 1,
        dprCap: lowPower ? 1 : 1.25,
      };
    };

    let renderProfile = getRenderProfile();

    const buildHalos = () => {
      halos = new Array(renderProfile.haloCount).fill(null).map((_, index) => {
        const baseRadius = Math.min(width, height) * randomBetween(0.32, 0.48);
        return {
          x: randomBetween(width * 0.15, width * 0.85),
          y: randomBetween(height * 0.12, height * 0.88),
          radius: baseRadius * (1 + index * 0.08),
          alpha: randomBetween(0.016, 0.028),
          pulseSpeed: randomBetween(0.00016, 0.00035),
          pulsePhase: randomBetween(0, Math.PI * 2),
          pulseAmount: randomBetween(0.01, 0.02),
          colorIndex: (index % 3) as 0 | 1 | 2,
        };
      });
    };

    const buildParticles = () => {
      const totalCount = Math.round(randomBetween(renderProfile.minCount, renderProfile.maxCount));

      const typeBCount = Math.floor(totalCount * renderProfile.typeBRatio);
      const typeCCount = Math.floor(totalCount * renderProfile.typeCRatio);
      const typeACount = totalCount - typeBCount - typeCCount;

      particles = new Array(totalCount);
      px = new Array<number>(totalCount);
      py = new Array<number>(totalCount);

      for (let i = 0; i < totalCount; i += 1) {
        const type: ParticleType = i < typeACount ? 0 : i < typeACount + typeBCount ? 1 : 2;

        const size =
          type === 0
            ? randomBetween(0.9, 2.0)
            : type === 1
              ? randomBetween(2.2, 3.8)
              : randomBetween(3.2, 6.2);

        const baseAlpha =
          type === 0
            ? randomBetween(0.2, 0.38)
            : type === 1
              ? randomBetween(0.58, 0.95)
              : randomBetween(0.68, 1);

        particles[i] = {
          type,
          baseX: randomBetween(0, width),
          baseY: randomBetween(0, height),
          ampX: randomBetween(2, type === 0 ? 8 : 15),
          ampY: randomBetween(2, type === 0 ? 7 : 13),
          phaseX: randomBetween(0, Math.PI * 2),
          phaseY: randomBetween(0, Math.PI * 2),
          speedX: randomBetween(0.0002, 0.00072),
          speedY: randomBetween(0.00016, 0.00062),
          size,
          baseAlpha,
          twinkle: randomBetween(0, Math.PI * 2),
          twinkleSpeed: type === 0 ? 0 : randomBetween(0.0008, 0.0024),
          twinkleDepth: type === 0 ? 0 : randomBetween(0.32, 0.62),
          linkPulse: randomBetween(0, Math.PI * 2),
          colorIndex: Math.floor(randomBetween(0, 3)) as 0 | 1 | 2,
        };
      }
    };

    const resize = () => {
      renderProfile = getRenderProfile();
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, renderProfile.dprCap);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildParticles();
      buildHalos();
    };

    const render = (timestamp: number) => {
      if (!shouldShow()) return;
      ctx.clearRect(0, 0, width, height);
      const image = document.querySelector('.hero-first-card img');
      if (!image) return;

      const imageBounds = image.getBoundingClientRect();
      ctx.save();
      ctx.beginPath();
      ctx.rect(imageBounds.left, imageBounds.top, imageBounds.width, imageBounds.height);
      ctx.clip();
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < halos.length; i += 1) {
        const h = halos[i];
        const pulse = 1 + Math.sin(timestamp * h.pulseSpeed + h.pulsePhase) * h.pulseAmount;
        const radius = h.radius * pulse;

        const gradient = ctx.createRadialGradient(h.x, h.y, radius * 0.05, h.x, h.y, radius);
        gradient.addColorStop(0, `${GOLD_COLORS[h.colorIndex]}22`);
        gradient.addColorStop(1, `${GOLD_COLORS[h.colorIndex]}00`);

        ctx.globalAlpha = h.alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(h.x, h.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        const x = p.baseX + Math.sin(timestamp * p.speedX + p.phaseX) * p.ampX;
        const y = p.baseY + Math.cos(timestamp * p.speedY + p.phaseY) * p.ampY;
        px[i] = x;
        py[i] = y;

        let alpha = p.baseAlpha;
        if (p.type !== 0) {
          const twinkleWave = (Math.sin(timestamp * p.twinkleSpeed + p.twinkle) + 1) * 0.5;
          const twinkleBlend = 0.72 + twinkleWave * 0.28;
          alpha = p.baseAlpha * (1 - p.twinkleDepth + p.twinkleDepth * twinkleBlend);
        }

        // Persistent molecular haze so linked particles remain visible over rich imagery.
        ctx.globalAlpha = alpha * (p.type === 0 ? 0.16 : 0.35);
        ctx.fillStyle = GOLD_COLORS[p.colorIndex];
        ctx.beginPath();
        ctx.arc(x, y, p.size * (p.type === 0 ? 1.9 : 2.3), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.fillStyle = GOLD_COLORS[p.colorIndex];
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.type === 2) {
          const heroGlow = 0.65 + (Math.sin(timestamp * 0.0009 + p.twinkle + p.phaseX) + 1) * 0.175;
          ctx.globalAlpha = alpha * 0.42 * heroGlow;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 3.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pronounced molecular interactions: visible links between bright/hero particles.
      ctx.lineCap = 'round';
      let linksDrawn = 0;
      for (let i = 0; i < particles.length && linksDrawn < renderProfile.maxLinks; i += 1) {
        const a = particles[i];
        if (a.type === 0) {
          continue;
        }
        for (let j = i + 1; j < particles.length && linksDrawn < renderProfile.maxLinks; j += 1) {
          const b = particles[j];
          if (b.type === 0) {
            continue;
          }

          const dx = px[i] - px[j];
          const dy = py[i] - py[j];
          const distSq = dx * dx + dy * dy;
          const maxDist = renderProfile.maxDist;
          const maxDistSq = maxDist * maxDist;
          if (distSq > maxDistSq) {
            continue;
          }

          const dist = Math.sqrt(distSq);
          const proximity = 1 - dist / maxDist;
          const pulse = 0.92 + (Math.sin(timestamp * 0.0012 + a.linkPulse + b.linkPulse) + 1) * 0.24;
          const alpha = proximity * renderProfile.linkAlphaBoost * pulse;

          ctx.globalAlpha = alpha;
          ctx.strokeStyle = GOLD_COLORS[a.type === 2 || b.type === 2 ? 2 : 1];
          ctx.lineWidth = a.type === 2 || b.type === 2 ? renderProfile.heroLineWidth : renderProfile.brightLineWidth;
          ctx.beginPath();
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
          ctx.stroke();
          linksDrawn += 1;
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    };

    const stop = () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      rafId = 0;
      timerId = 0;
    };

    const schedule = () => {
      if (document.hidden || !shouldAnimate()) return;
      timerId = window.setTimeout(() => {
        timerId = 0;
        rafId = window.requestAnimationFrame(draw);
      }, Math.max(0, renderProfile.frameIntervalMs - (performance.now() - lastRenderAt)));
    };

    const draw = (timestamp: number) => {
      rafId = 0;
      if (document.hidden || !shouldAnimate()) return;
      if (timestamp - lastRenderAt >= renderProfile.frameIntervalMs) {
        render(timestamp);
        lastRenderAt = timestamp;
      }
      schedule();
    };

    const refresh = () => {
      stop();
      canvas.style.display = shouldShow() ? 'block' : 'none';
      resize();
      lastRenderAt = -Infinity;
      if (document.hidden) return;
      if (shouldAnimate()) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        render(0);
      }
    };

    const onVisibilityChange = () => {
      stop();
      if (document.hidden) return;
      lastRenderAt = -Infinity;
      if (shouldAnimate()) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        render(0);
      }
    };

    const onScroll = () => {
      if (!document.hidden && !shouldAnimate()) {
        render(0);
      }
    };

    refresh();
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    const mediaQueries = [coarsePointer, narrowViewport, reducedMotion];
    mediaQueries.forEach((query) => query.addEventListener('change', refresh));

    return () => {
      stop();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      mediaQueries.forEach((query) => query.removeEventListener('change', refresh));
    };
  }, [pathname]);

  if (pathname !== '/') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="homepage-ambient-particles"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 6,
        opacity: 0.57,
      }}
    />
  );
}
