'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { clamp, damp, sceneState, smoothstep } from '@/lib/scene-state';

/* ------------------------------------------------------------------
   The signature moment.

   A garment is built from TWO curved panels that face away from each
   other — front bulging toward the viewer, back bulging away — so the
   pair closes into a real volume instead of a flat card. Rotating the
   group therefore turns a solid object: you see the chest, the shirt
   turns through its own thickness, and the print on the back arrives.

   Each panel uses FrontSide/BackSide culling, so exactly one of the two
   ever draws. No transparency sorting to fight.
   ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBend;
  uniform float uSide;    // +1 front panel, -1 back panel
  uniform float uWave;
  uniform vec2  uSize;    // panel size in world units

  varying vec2 vUv;
  varying vec3 vNormal;

  // height field of the hanging cloth, in local Z.
  // One smooth radial bulge — maximal at the chest, easing to zero at every
  // edge — so the panel reads as a stuffed garment, never as folded card.
  float zAt(vec2 q) {
    vec2 d = (q - 0.5) * 2.0;
    float r = clamp(length(vec2(d.x * 0.86, d.y * 0.94)), 0.0, 1.0);
    float z = cos(r * 1.5707963) * uBend;

    // the cloth breathes, strongest where it hangs loose
    float slack = 1.0 - r;
    z += sin(q.y * 7.0 + uTime * 0.50) * 0.009 * uWave * slack;
    z += sin(q.x * 5.0 - uTime * 0.40) * 0.007 * uWave * slack;

    return z * uSide;
  }

  void main() {
    vUv = uv;

    float e = 0.01;
    vec3 P  = vec3(position.x, position.y, zAt(uv));
    vec3 Px = vec3(position.x + e * uSize.x, position.y, zAt(uv + vec2(e, 0.0)));
    vec3 Py = vec3(position.x, position.y + e * uSize.y, zAt(uv + vec2(0.0, e)));
    vec3 N  = normalize(cross(Px - P, Py - P));

    vec4 mv = modelViewMatrix * vec4(P, 1.0);
    vNormal = normalize(normalMatrix * N);

    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uMirror;   // 1.0 on the back panel — un-mirrors the print

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec2 uv = vec2(mix(vUv.x, 1.0 - vUv.x, uMirror), vUv.y);
    vec4 tex = texture2D(uMap, uv);
    if (tex.a < 0.02) discard;

    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;

    // The textures are photographs with their own baked lighting, so we only
    // modulate gently — enough for the folds to catch light, not enough to
    // turn white cotton grey.
    vec3  L    = normalize(vec3(-0.35, 0.62, 0.90));
    float diff = 0.93 + 0.16 * max(dot(n, L), 0.0);

    // No fresnel rim here on purpose: these panels are shallow, so
    // 1 - dot(n, view) is near-uniform across the whole surface and a rim term
    // floods dark cotton with colour instead of edging it. The halo behind the
    // garment does the separating instead.
    vec3 col = tex.rgb * diff;

    gl_FragColor = vec4(col, tex.a * uOpacity);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(1.0 - clamp(d, 0.0, 1.0), 3.0);
    gl_FragColor = vec4(uColor, a * uOpacity);
  }
`;

const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PANEL_HEIGHT = 2.55;
const GOLD = new THREE.Color('#d7b56d');

type PanelUniforms = {
  uTime: { value: number };
  uBend: { value: number };
  uSide: { value: number };
  uWave: { value: number };
  uSize: { value: THREE.Vector2 };
  uMap: { value: THREE.Texture };
  uOpacity: { value: number };
  uMirror: { value: number };
};

export function Garment({
  front,
  back,
  aspect,
  index,
  total,
}: {
  front: string;
  back: string;
  aspect: number;
  index: number;
  total: number;
}) {
  const group = useRef<THREE.Group>(null);
  // Rotation lives on an inner group so the halo never turns with the garment:
  // parented to the spin, its z=-0.9 offset swings in FRONT past 90 degrees and
  // washes the dark pieces gold.
  const spin = useRef<THREE.Group>(null);
  const [frontMap, backMap] = useTexture([front, back], (loaded) => {
    const list = Array.isArray(loaded) ? loaded : [loaded];
    for (const t of list) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
    }
  });

  const width = PANEL_HEIGHT * aspect;
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(width, PANEL_HEIGHT, 80, 80),
    [width],
  );

  const mkUniforms = (map: THREE.Texture, side: number, mirror: number): PanelUniforms => ({
    uTime: { value: 0 },
    uBend: { value: 0.3 },
    uSide: { value: side },
    uWave: { value: 1 },
    uSize: { value: new THREE.Vector2(width, PANEL_HEIGHT) },
    uMap: { value: map },
    uOpacity: { value: 0 },
    uMirror: { value: mirror },
  });

  const frontU = useMemo(() => mkUniforms(frontMap, 1, 0), [frontMap, width]);
  const backU = useMemo(() => mkUniforms(backMap, -1, 1), [backMap, width]);
  const haloU = useMemo(
    () => ({ uColor: { value: GOLD }, uOpacity: { value: 0 } }),
    [],
  );

  const shown = useRef(0);
  // Uniforms are mutated through the material instances, never through the
  // props object — R3F does not guarantee the prop object stays identical to
  // material.uniforms, and a silently detached object renders nothing.
  const frontMat = useRef<THREE.ShaderMaterial>(null);
  const backMat = useRef<THREE.ShaderMaterial>(null);
  const haloMat = useRef<THREE.ShaderMaterial>(null);

  useFrame((state, delta) => {
    const g = group.current;
    const sp = spin.current;
    const fu = frontMat.current?.uniforms;
    const bu = backMat.current?.uniforms;
    const hu = haloMat.current?.uniforms;
    if (!g || !sp || !fu || !bu || !hu) return;

    const dt = Math.min(delta, 0.05);
    const t = sceneState.showcaseProgress * total - index;

    // crossfade windows overlap so the stage is never empty
    const appear = smoothstep(-0.20, 0.02, t);
    const leave = 1 - smoothstep(0.98, 1.2, t);
    const target = appear * leave * sceneState.stage;

    shown.current = damp(shown.current, target, 12, dt);
    const o = shown.current;

    fu.uOpacity.value = o;
    bu.uOpacity.value = o;
    hu.uOpacity.value = o * 0.14;

    g.visible = o > 0.002;
    if (!g.visible) return;

    const time = state.clock.elapsedTime;
    fu.uTime.value = time;
    bu.uTime.value = time;

    if (sceneState.reducedMotion) {
      // no turning, no drift — the front of the garment, held still
      sp.rotation.set(0, 0, 0);
      g.position.set(0, 0, 0);
      g.scale.setScalar(1);
      fu.uWave.value = 0;
      bu.uWave.value = 0;
      return;
    }

    // THE turn: front-on → through its own thickness → back-on
    sp.rotation.y = clamp(t, -0.2, 1.2) * Math.PI;

    // secondary motion at ~30% amplitude, plus pointer parallax
    sp.rotation.x = Math.sin(clamp(t) * Math.PI) * 0.075 + sceneState.pointerY * 0.05;
    sp.rotation.z = Math.sin(time * 0.25) * 0.012;

    g.position.x = sceneState.pointerX * 0.09;
    g.position.y = Math.sin(time * 0.42) * 0.035;
    g.position.z = -0.85 * (1 - o);

    const s = 0.94 + 0.06 * o;
    g.scale.setScalar(s);
  });

  return (
    <group ref={group}>
      {/* Halo — separates the garment from the starfield without a shadow.
          Deliberately OUTSIDE the spinning group, and drawn first, so it can
          never swing in front of the panels and tint them. */}
      <mesh
        renderOrder={-1}
        position={[0, 0, -0.9]}
        scale={[width * 2.1, PANEL_HEIGHT * 2.1, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={haloMat}
          vertexShader={haloVertex}
          fragmentShader={haloFragment}
          uniforms={haloU}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* the two panels that close into a volume — only these turn */}
      <group ref={spin}>
        <mesh geometry={geometry}>
          <shaderMaterial
            ref={frontMat}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={frontU}
            transparent
            side={THREE.FrontSide}
          />
        </mesh>

        <mesh geometry={geometry}>
          <shaderMaterial
            ref={backMat}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={backU}
            transparent
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </group>
  );
}
