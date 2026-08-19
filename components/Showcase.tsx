'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brl, showcase } from '@/lib/products';
import { clamp, sceneState } from '@/lib/scene-state';

gsap.registerPlugin(ScrollTrigger);

export default function Showcase() {
  const section = useRef<HTMLElement>(null);
  const turnRail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  /** 0 = chest facing you, 1 = print facing you */
  const [face, setFace] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = showcase.length;

    if (reduced) {
      sceneState.stage = 1;
      sceneState.showcaseProgress = 0;
      return;
    }

    const setTurn = gsap.quickSetter(turnRail.current, '--turn') as (v: string) => void;
    let lastIndex = -1;
    let lastFace = -1;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${total * 115}%`,
        pin: '[data-showcase-pin]',
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          sceneState.showcaseProgress = self.progress;

          // Must match the crossfade midpoint in Garment.tsx exactly, or the
          // copy describes one piece while another is on stage.
          const t = self.progress * total;
          const idx = clamp(Math.floor(t), 0, total - 1);
          if (idx !== lastIndex) {
            lastIndex = idx;
            setActive(idx);
          }

          // local turn within the active garment, 0 → 1
          const local = clamp(t - idx);
          setTurn(String(local));
          const f = local > 0.5 ? 1 : 0;
          if (f !== lastFace) {
            lastFace = f;
            setFace(f);
          }
        },
      });

      // The garment lights up while the section is still travelling into view,
      // so it is already on stage by the time the pin takes hold.
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        // 'bottom bottom' lands on the pin release, so the garment is gone
        // before the collection grid scrolls up behind it
        end: 'bottom bottom',
        onToggle: (self) => {
          gsap.to(sceneState, {
            stage: self.isActive ? 1 : 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true,
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const p = showcase[active];

  return (
    <section ref={section} id="showcase" aria-labelledby="showcase-title" className="relative">
      <div data-showcase-pin className="relative h-[100svh] w-full">
        {/* On phones the garment sits above the copy, so the scrim only has to
            protect the lower half. On desktop it protects the left column. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink from-38% via-ink/85 to-transparent lg:bg-gradient-to-r lg:from-ink lg:from-0% lg:via-ink/60 lg:to-transparent" />

        <div className="relative mx-auto flex h-full w-full max-w-[110rem] flex-col justify-end gap-8 px-6 pb-16 sm:px-10 lg:justify-center lg:pb-0">
          <div className="lg:max-w-[34rem]">
            <p className="label mb-6">
              <span className="text-gold">{String(active + 1).padStart(2, '0')}</span>
              <span className="mx-2 opacity-40">/</span>
              {String(showcase.length).padStart(2, '0')} — Cápsula {p.capsule}
            </p>

            <h2
              id="showcase-title"
              key={p.id}
              className="display text-bone"
              style={{ fontSize: 'var(--step-4)' }}
            >
              {p.name}
            </h2>

            {p.inscription && (
              <p
                className="mt-4 text-gold/90 italic"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-1)' }}
              >
                “{p.inscription}”
              </p>
            )}

            <p className="mt-6 max-w-[46ch] text-dim" style={{ fontSize: 'var(--step-0)' }}>
              {p.blurb}
            </p>

            {/* Tells the visitor what the rotation is doing — the 3D has to be
                legible, not just pretty. */}
            <div
              ref={turnRail}
              className="mt-10 flex items-center gap-4"
              style={{ ['--turn' as string]: 0 }}
            >
              <span
                className={`label transition-colors duration-300 ${face === 0 ? 'text-bone' : 'text-dim/50'}`}
              >
                Frente
              </span>
              <span className="relative h-px w-28 bg-line sm:w-40">
                <span
                  className="absolute inset-y-0 left-0 bg-gold"
                  style={{ width: 'calc(var(--turn) * 100%)' }}
                />
                <span
                  className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
                  style={{ left: 'calc(var(--turn) * 100%)' }}
                />
              </span>
              <span
                className={`label transition-colors duration-300 ${face === 1 ? 'text-bone' : 'text-dim/50'}`}
              >
                Verso
              </span>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <p className="display text-bone" style={{ fontSize: 'var(--step-2)' }}>
                {brl(p.price)}
              </p>
              <p className="text-dim" style={{ fontSize: 'var(--step--1)' }}>
                ou <span className="text-bone">{brl(p.pix)}</span> no Pix
              </p>
              <a
                href={p.href}
                className="group inline-flex cursor-pointer items-center gap-3 border-b border-gold/40 pb-1 text-bone transition-colors duration-200 hover:border-gold"
              >
                <span>Comprar {p.name}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M2 8h12M9 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Shown only when WebGL is unavailable, so the section still works. */}
        <div className="showcase-fallback pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center p-10">
          <Image
            src={face === 1 ? p.back : p.front}
            alt={`${p.name} — ${face === 1 ? 'verso' : 'frente'}`}
            width={520}
            height={520}
            className="h-auto w-full max-w-[26rem] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
