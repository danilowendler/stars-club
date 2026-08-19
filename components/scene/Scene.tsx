'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Starfield } from './Starfield';
import { Garment } from './Garment';
import { showcase } from '@/lib/products';
import { damp, sceneState } from '@/lib/scene-state';

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

/** Places the garments where the layout leaves room for them. */
function GarmentStage() {
  const group = useRef<THREE.Group>(null);
  const { viewport, size } = useThree();

  const layout = useMemo(() => {
    const wide = size.width >= 1024;
    return {
      // clears the copy column on desktop; sits above the copy on phones
      x: wide ? viewport.width * 0.26 : 0,
      y: wide ? 0 : viewport.height * 0.2,
      scale: wide
        ? Math.min(1.05, viewport.height / 4.1)
        : Math.min(0.72, viewport.width / 4.6),
    };
  }, [viewport.width, viewport.height, size.width]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    g.position.x = damp(g.position.x, layout.x, 6, dt);
    g.position.y = layout.y;
    const s = layout.scale;
    g.scale.x = damp(g.scale.x, s, 6, dt);
    g.scale.y = g.scale.x;
    g.scale.z = g.scale.x;
  });

  return (
    <group ref={group} scale={0.9}>
      {showcase.map((p, i) => (
        <Garment
          key={p.id}
          front={p.front}
          back={p.back}
          aspect={p.aspect}
          index={i}
          total={showcase.length}
        />
      ))}
    </group>
  );
}

export default function Scene() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const has = supportsWebGL();
    setOk(has);
    // lets the DOM fall back to flat product shots when there is no GPU path
    document.documentElement.classList.toggle('no-webgl', !has);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => {
      sceneState.reducedMotion = mq.matches;
    };
    applyMotion();
    mq.addEventListener('change', applyMotion);

    const fine = window.matchMedia('(pointer: fine)');
    const onPointer = (e: PointerEvent) => {
      if (!fine.matches) return;
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      mq.removeEventListener('change', applyMotion);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  if (!ok) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 38, near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
          // The garment maps are photographs; filmic tone mapping would crush
          // white cotton to grey. Keep the photographic values intact.
          gl.toneMapping = THREE.NoToneMapping;
        }}
      >
        <Suspense fallback={null}>
          <Starfield />
          <GarmentStage />
        </Suspense>
      </Canvas>
    </div>
  );
}
