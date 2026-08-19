'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { damp, sceneState } from '@/lib/scene-state';

/* Ambient layer, ≤20% of the primary's visual energy.
   Three depth bands drift at different rates so the sky has volume. */

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aGold;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTwinkle;

  varying float vAlpha;
  varying float vGold;

  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.06 + aPhase * 6.2831) * 0.12;
    p.x += cos(uTime * 0.045 + aPhase * 6.2831) * 0.10;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vAlpha = mix(1.0, 0.55 + 0.45 * sin(uTime * 0.9 + aPhase * 6.2831), uTwinkle);
    vGold  = aGold;

    gl_PointSize = aSize * uPixelRatio * (36.0 / max(-mv.z, 0.001));
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uWhite;
  uniform vec3 uGold;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vGold;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(1.0 - d * 2.0, 2.6);
    vec3 c = mix(uWhite, uGold, vGold);
    gl_FragColor = vec4(c, a * vAlpha * uOpacity);
  }
`;

export function Starfield({ count = 1300 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const gold = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // three depth bands → parallax without extra draw calls
      const band = i % 3;
      const z = -4 - band * 7 - Math.random() * 5;
      const spread = 13 + band * 9;
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.8;
      pos[i * 3 + 2] = z;

      // a handful of brighter ones give the sky a focal structure
      const hero = Math.random() < 0.06 ? 2.1 : 1;
      size[i] = (0.55 + Math.random() * 1.7) * (band === 0 ? 1.6 : 1) * hero;
      phase[i] = Math.random();
      // a minority burn gold — the same gold as the print, used sparingly
      gold[i] = Math.random() < 0.22 ? 0.6 + Math.random() * 0.4 : 0;
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aGold', new THREE.BufferAttribute(gold, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uTwinkle: { value: 1 },
      uWhite: { value: new THREE.Color('#f4f1ea') },
      uGold: { value: new THREE.Color('#d7b56d') },
      uOpacity: { value: 0 },
    }),
    [],
  );

  const lit = useRef(0);

  useFrame((state, delta) => {
    const p = points.current;
    if (!p) return;
    const dt = Math.min(delta, 0.05);

    uniforms.uPixelRatio.value = state.gl.getPixelRatio();

    if (sceneState.reducedMotion) {
      uniforms.uTwinkle.value = 0;
      uniforms.uOpacity.value = 0.85;
      return;
    }

    uniforms.uTime.value = state.clock.elapsedTime;
    lit.current = damp(lit.current, 0.9, 2.2, dt);
    uniforms.uOpacity.value = lit.current;

    // the sky drifts against the page — counter-motion at ~20% speed
    const scrollUnits = (sceneState.scrollY / Math.max(window.innerHeight, 1)) * viewport.height;
    p.position.y = scrollUnits * 0.16;
    p.rotation.z = scrollUnits * 0.004;

    p.position.x = damp(p.position.x, sceneState.pointerX * 0.45, 3, dt);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
