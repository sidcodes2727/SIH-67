import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
  RocksBackground: fixed, full-page GSAP polygon rock background
  - Spans the whole Home page (fixed inset-0)
  - Multi-layer polygonal rocks at top, mid, bottom
  - Pointer parallax + scroll-linked motion (always on)
  - Non-interactive (pointer-events: none)
*/
export default function RocksBackground() {
  const rootRef = useRef(null);
  const tFar = useRef(null);
  const tNear = useRef(null);
  const mid = useRef(null);
  const bFar = useRef(null);
  const bNear = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const node = rootRef.current;
      if (!node) return;
      node.style.perspective = '1100px';

      // Seeded RNG so a look can be reproduced via ?rockSeed=12345
      const url = new URL(window.location.href);
      const seedParam = url.searchParams.get('rockSeed');
      let seed = seedParam ? parseInt(seedParam, 10) : Math.floor(Math.random() * 1e9);
      // Mulberry32 PRNG
      const mulberry32 = (a) => { return function() { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } };
      const rng = mulberry32(seed);
      const rrange = (min, max) => min + (max - min) * rng();
      // Expose seed in console for reuse
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(`[RocksBackground] seed: ${seed}`);
      }

      // Randomize each polygon slightly so rocks aren't on one line
      const jitter = (layerRef, ax = 22, ay = 8, rot = 1.5, sMin = 0.9, sMax = 1.12) => {
        const root = layerRef?.current;
        if (!root) return;
        const polys = root.querySelectorAll('polygon');
        polys.forEach((p, i) => {
          gsap.set(p, {
            x: rrange(-ax, ax),
            y: rrange(-ay, ay),
            rotation: rrange(-rot, rot),
            scale: rrange(sMin, sMax),
            transformOrigin: '50% 50%'
          });
        });
      };

      // Densify by cloning some polygons with varied scale/position (kept subtle to avoid clutter)
      const densify = (layerRef, probability = 0.25, ax = 100, ay = 10, sMin = 0.7, sMax = 0.95) => {
        const root = layerRef?.current;
        if (!root) return;
        const svg = root.querySelector('svg');
        if (!svg) return;
        const group = svg.querySelector('g');
        if (!group) return;
        const original = Array.from(group.querySelectorAll('polygon'));
        original.forEach((p) => {
          if (rng() < probability) {
            const clone = p.cloneNode(true);
            group.appendChild(clone);
            gsap.set(clone, {
              x: rrange(-ax, ax),
              y: rrange(-ay, ay),
              rotation: rrange(-3, 3),
              scale: rrange(sMin, sMax),
              transformOrigin: '50% 50%'
            });
          }
        });
      };

      // Spread polygons horizontally in each layer to reduce stacking
      const spreadX = (layerRef, stride = 48) => {
        const root = layerRef?.current;
        if (!root) return;
        const polys = root.querySelectorAll('polygon');
        polys.forEach((p, i) => {
          const offset = (i % 5 - 2) * stride + rrange(-10, 10);
          gsap.set(p, { x: "+=" + offset });
        });
      };

      // Randomize polygon X positions across the layer width while maintaining spacing
      // Uses viewBox width to compute evenly spaced slots, then shuffles them and
      // moves each polygon's center to a random slot with some jitter.
      const randomizeX = (layerRef, pad = 60, jitterFrac = 0.3) => {
        const root = layerRef?.current;
        if (!root) return;
        const svg = root.querySelector('svg');
        if (!svg) return;
        const group = svg.querySelector('g');
        if (!group) return;
        const polys = Array.from(group.querySelectorAll('polygon'));
        if (!polys.length) return;

        const vb = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : { width: 1200 };
        const width = vb.width || 1200;
        const n = polys.length;
        const usable = Math.max(width - pad * 2, 200);
        const stride = usable / n;

        // Build slot centers then shuffle
        const slots = Array.from({ length: n }, (_, i) => pad + i * stride + stride / 2);
        for (let i = slots.length - 1; i > 0; i--) { // Fisher-Yates using rng()
          const j = Math.floor(rng() * (i + 1));
          [slots[i], slots[j]] = [slots[j], slots[i]];
        }

        polys.forEach((p, i) => {
          const bbox = p.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const jitter = rrange(-stride * jitterFrac, stride * jitterFrac);
          const target = slots[i] + jitter;
          const delta = target - centerX;
          gsap.set(p, { x: "+=" + delta.toFixed(2) });
        });
      };

      const float = (el, amp = 6, dur = 6, delay = 0) => {
        if (!el) return;
        gsap.to(el, { y: `+=${amp}`, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1, delay });
      };
      float(tFar.current, 3, 5.4, 0.15);
      float(tNear.current, 5, 5.8, 0.25);
      float(mid.current, 6, 6.2, 0.35);
      float(bFar.current, 7, 6.0, 0.2);
      float(bNear.current, 9, 6.4, 0.3);

      // Apply jitter, subtle densify, and randomized horizontal layout (top to bottom)
      jitter(tFar, 16, 8, 1.2, 0.9, 1.12); densify(tFar, 0.06, 160, 12, 0.75, 0.95); randomizeX(tFar, 80, 0.35);
      jitter(tNear, 18, 9, 1.4, 0.9, 1.15); densify(tNear, 0.08, 170, 12, 0.78, 0.98); randomizeX(tNear, 90, 0.35);
      jitter(mid, 20, 10, 1.6, 0.9, 1.18); densify(mid, 0.10, 180, 12, 0.8, 1.0); randomizeX(mid, 100, 0.35);
      jitter(bFar, 22, 11, 1.8, 0.92, 1.2); densify(bFar, 0.12, 190, 12, 0.82, 1.05); randomizeX(bFar, 110, 0.35);
      jitter(bNear, 24, 12, 2.0, 0.95, 1.22); densify(bNear, 0.14, 200, 14, 0.85, 1.08); randomizeX(bNear, 120, 0.35);

      // Continuous per-polygon displacement (wiggle) that returns to base
      const wigglePolys = (layerRef, dx = 8, dy = 6, durMin = 2.2, durMax = 3.0, stagger = 0.035) => {
        const root = layerRef?.current;
        if (!root) return;
        const polys = root.querySelectorAll('polygon');
        gsap.to(polys, {
          x: (i) => `+=${rrange(-dx, dx).toFixed(2)}`,
          y: (i) => `+=${rrange(-dy, dy).toFixed(2)}`,
          rotation: (i) => rrange(-1.5, 1.5),
          duration: (i) => rrange(durMin, durMax),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger,
        });
      };
      wigglePolys(tFar, 6, 4, 2.0, 2.6, 0.03);
      wigglePolys(tNear, 7, 5, 2.0, 2.7, 0.035);
      wigglePolys(mid, 8, 6, 2.1, 2.8, 0.04);
      wigglePolys(bFar, 9, 7, 2.2, 3.0, 0.045);
      wigglePolys(bNear, 10, 8, 2.3, 3.1, 0.05);

      const handleMove = (e) => {
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = (clientX - cx) / rect.width;
        const y = (clientY - cy) / rect.height;
        gsap.to(tFar.current,  { x: x * 20, y: y * 10, rotateY: x * 6, duration: 0.35, ease: 'sine.out' });
        gsap.to(tNear.current, { x: x * 28, y: y * 14, rotateY: x * 9, duration: 0.35, ease: 'sine.out' });
        gsap.to(mid.current,    { x: x * 36, y: y * 18, rotateY: x * 11, duration: 0.35, ease: 'sine.out' });
        gsap.to(bFar.current,  { x: x * 44, y: y * 22, rotateY: x * 12, duration: 0.35, ease: 'sine.out' });
        gsap.to(bNear.current, { x: x * 56, y: y * 28, rotateY: x * 14, duration: 0.35, ease: 'sine.out' });
      };
      node.addEventListener('mousemove', handleMove);
      node.addEventListener('touchmove', handleMove, { passive: true });

      const makeScroll = (el, yFrom, yTo, z, rotateX = -6) => {
        if (!el) return;
        gsap.set(el, { transformStyle: 'preserve-3d', z });
        gsap.fromTo(el, { y: yFrom, rotateX }, {
          y: yTo,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });
      };
      // top layers - move slightly down as you scroll
      makeScroll(tFar.current, -40, 20, -140);
      makeScroll(tNear.current, -60, 40, -80);
      // mid band
      makeScroll(mid.current, -20, -60, -40);
      // bottom layers - move upwards as you scroll for strong parallax
      makeScroll(bFar.current, 40, -120, -20);
      makeScroll(bNear.current, 60, -180, 0);

      return () => {
        node.removeEventListener('mousemove', handleMove);
        node.removeEventListener('touchmove', handleMove);
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="fixed inset-0 -z-10 overflow-hidden select-none pointer-events-none">
      {/* gentle radial glow */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(1200px 600px at 50% -10%, rgba(100,255,218,0.10), transparent 60%)'
      }} />

      {/* TOP FAR */}
      <div ref={tFar} className="absolute inset-x-0 mx-auto w-[1200px] max-w-none opacity-60 will-change-transform" style={{ top: '4%', transform: 'translateZ(-140px)' }}>
        <svg viewBox="0 0 1200 180" className="w-full h-auto">
          <defs>
            <linearGradient id="rfTopFar" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#16212e" />
              <stop offset="100%" stopColor="#0a111d" />
            </linearGradient>
          </defs>
          <g fill="url(#rfTopFar)">
            <polygon points="60,100 95,50 140,64 155,102 110,118" />
            <polygon points="260,96 295,50 340,66 355,104 310,118" />
            <polygon points="500,98 535,52 585,68 600,106 555,120" />
            <polygon points="760,96 795,52 845,70 860,108 815,122" />
            <polygon points="980,94 1015,50 1065,68 1080,106 1035,120" />
          </g>
        </svg>
      </div>

      {/* TOP NEAR */}
      <div ref={tNear} className="absolute inset-x-0 mx-auto w-[1250px] max-w-none opacity-80 will-change-transform" style={{ top: '11%', transform: 'translateZ(-80px)' }}>
        <svg viewBox="0 0 1250 200" className="w-full h-auto">
          <defs>
            <linearGradient id="rfTopNear" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1e2a3a" />
              <stop offset="100%" stopColor="#0b1220" />
            </linearGradient>
          </defs>
          <g fill="url(#rfTopNear)">
            <polygon points="100,130 155,76 220,93 235,136 170,152" />
            <polygon points="380,132 440,80 515,98 530,142 455,158" />
            <polygon points="690,130 750,82 830,100 845,144 760,160" />
            <polygon points="980,132 1040,84 1120,102 1135,146 1050,162" />
          </g>
        </svg>
      </div>

      {/* MID BAND */}
      <div ref={mid} className="absolute inset-x-0 mx-auto w-[1280px] max-w-none opacity-78 will-change-transform" style={{ top: '36%', transform: 'translateZ(-40px)' }}>
        <svg viewBox="0 0 1280 220" className="w-full h-auto">
          <defs>
            <linearGradient id="rfMid" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#223041" />
              <stop offset="100%" stopColor="#0b1220" />
            </linearGradient>
          </defs>
          <g fill="url(#rfMid)">
            <polygon points="60,170 140,120 230,140 245,180 160,200" />
            <polygon points="360,172 450,120 550,142 570,186 460,206" />
            <polygon points="700,170 790,122 900,146 915,190 800,210" />
            <polygon points="1000,170 1090,126 1200,150 1215,194 1090,212" />
          </g>
        </svg>
      </div>

      {/* BOTTOM FAR */}
      <div ref={bFar} className="absolute inset-x-0 bottom-8 mx-auto w-[1220px] max-w-none opacity-80 will-change-transform" style={{ transform: 'translateZ(-20px)' }}>
        <svg viewBox="0 0 1220 320" className="w-full h-auto">
          <defs>
            <linearGradient id="rfBottomFar" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#273447" />
              <stop offset="100%" stopColor="#0b1220" />
            </linearGradient>
          </defs>
          <g fill="url(#rfBottomFar)" stroke="#00000022" strokeWidth="1">
            <polygon points="100,255 160,205 220,220 235,265 170,285" />
            <polygon points="360,260 420,210 490,225 505,270 430,290" />
            <polygon points="650,258 705,210 780,228 795,272 715,292" />
            <polygon points="900,260 955,212 1025,230 1040,275 960,295" />
          </g>
        </svg>
      </div>

      {/* BOTTOM NEAR */}
      <div ref={bNear} className="absolute inset-x-0 bottom-0 mx-auto w-[1280px] max-w-none will-change-transform">
        <svg viewBox="0 0 1280 320" className="w-full h-auto">
          <defs>
            <linearGradient id="rfBottomNear" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2c3b50" />
              <stop offset="100%" stopColor="#0b1220" />
            </linearGradient>
            <linearGradient id="rfShadow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00000055" />
              <stop offset="100%" stopColor="#00000000" />
            </linearGradient>
          </defs>
          <g>
            <polygon fill="url(#rfBottomNear)" points="40,295 140,230 260,250 280,300 160,315" />
            <polygon fill="url(#rfBottomNear)" points="300,300 420,235 560,255 585,305 430,320" />
            <polygon fill="url(#rfBottomNear)" points="620,298 760,235 910,260 935,308 760,320" />
            <polygon fill="url(#rfBottomNear)" points="880,300 980,245 1120,265 1140,312 980,320" />
          </g>
          <rect x="0" y="300" width="1280" height="20" fill="url(#rfShadow)" />
        </svg>
      </div>
    </div>
  );
}
