/**
 * A tiny mutable store shared between the DOM (GSAP ScrollTrigger writes)
 * and the WebGL layer (useFrame reads). Deliberately NOT React state:
 * setState at 60fps would re-render the tree every frame.
 */
export const sceneState = {
  /** 0 → 1 across the whole pinned showcase section */
  showcaseProgress: 0,
  /** how "on stage" the garments are (0 hidden, 1 fully lit) */
  stage: 0,
  /** normalised pointer, -1 → 1 */
  pointerX: 0,
  pointerY: 0,
  /** total page scroll in px, for starfield parallax */
  scrollY: 0,
  reducedMotion: false,
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
