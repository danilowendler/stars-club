'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export const LOADED_EVENT = 'tsc:loaded';

function markLoaded() {
  document.documentElement.dataset.loaded = 'true';
  window.dispatchEvent(new Event(LOADED_EVENT));
}

export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setGone(true);
      markLoaded();
      return;
    }

    document.body.style.overflow = 'hidden';
    const counter = { v: 0 };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          setGone(true);
          markLoaded();
        },
      });

      tl.to(counter, {
        v: 100,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          const n = root.current?.querySelector('[data-count]');
          const bar = root.current?.querySelector<HTMLElement>('[data-bar]');
          if (n) n.textContent = String(Math.round(counter.v)).padStart(3, '0');
          if (bar) bar.style.transform = `scaleX(${counter.v / 100})`;
        },
      })
        .to('[data-loader-inner]', { opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.12')
        .to(root.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.1');
    }, root);

    return () => {
      document.body.style.overflow = '';
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
      role="status"
      aria-live="polite"
    >
      <div data-loader-inner className="flex w-full max-w-md flex-col items-center px-8">
        <Image
          src="/brand/wordmark.png"
          alt=""
          width={600}
          height={255}
          priority
          className="h-auto w-56"
        />
        <p className="label mt-10">Acendendo as estrelas</p>

        <div className="mt-6 h-px w-full overflow-hidden bg-line">
          <span
            data-bar
            className="block h-full w-full origin-left bg-gold"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        <p className="label mt-4 tabular-nums text-gold" data-count>
          000
        </p>
        <span className="sr-only">Carregando a loja</span>
      </div>
    </div>
  );
}
