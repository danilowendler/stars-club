'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { LOADED_EVENT } from './Loader';

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(
        '[data-hero-kicker], [data-hero-mark], [data-hero-line], [data-hero-sub] > *, [data-hero-cue]',
        { opacity: 1 },
      );
      return;
    }

    let ctx: gsap.Context | undefined;

    // starts the instant the loader clears, so there is no dead frame
    const start = () => {
      ctx = gsap.context(() => {
        // Entrance choreography: the answer to "what is this" lands inside 1.2s.
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo('[data-hero-kicker]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 })
          .fromTo(
            '[data-hero-mark]',
            { opacity: 0, y: 26, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1 },
            '-=0.45',
          )
          .fromTo(
            '[data-hero-line]',
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.9 },
            '-=0.75',
          )
          .fromTo(
            '[data-hero-sub] > *',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 },
            '-=0.6',
          )
          .fromTo('[data-hero-cue]', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3');
      }, root);
    };

    if (document.documentElement.dataset.loaded === 'true') {
      start();
    } else {
      window.addEventListener(LOADED_EVENT, start, { once: true });
    }

    return () => {
      window.removeEventListener(LOADED_EVENT, start);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center px-6 pt-28 pb-16 sm:px-10"
    >
      <div className="mx-auto w-full max-w-[110rem]">
        <p data-hero-kicker className="label mb-10 opacity-0">
          Frete grátis acima de R$ 599
          <span className="mx-3 text-gold">·</span>
          Até 3x sem juros
          <span className="mx-3 text-gold">·</span>
          5% OFF no Pix
        </p>

        <h1 className="max-w-[22ch]">
          <span data-hero-mark className="block opacity-0">
            <Image
              src="/brand/wordmark.png"
              alt="The Stars Club"
              width={1200}
              height={510}
              priority
              className="h-auto w-[min(34rem,72vw)]"
            />
          </span>
          <span
            data-hero-line
            className="display mt-8 block text-balance text-bone opacity-0"
            style={{ fontSize: 'var(--step-display)' }}
          >
            Nós vemos as estrelas.
          </span>
        </h1>

        <div data-hero-sub className="mt-10 max-w-[46ch]">
          <p className="text-dim" style={{ fontSize: 'var(--step-0)' }}>
            Streetwear autoral do Brasil, em cápsulas pequenas. Camisetas, moletom, tricô e jeans —
            cada peça guarda uma imagem inteira nas costas.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <a
              href="#showcase"
              className="group inline-flex cursor-pointer items-center gap-3 bg-bone px-8 py-4 text-ink transition-colors duration-200 hover:bg-gold"
              style={{ fontSize: 'var(--step--1)' }}
            >
              <span className="font-medium tracking-wide">Ver a coleção</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-y-0.5"
              >
                <path
                  d="M8 2v12M3 9l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#pecas"
              className="cursor-pointer border-b border-line pb-1 text-dim transition-colors duration-200 hover:border-gold hover:text-bone"
              style={{ fontSize: 'var(--step--1)' }}
            >
              Ver as 7 peças
            </a>
          </div>
        </div>
      </div>

      {/* tells you the scroll does something before you find out by accident */}
      <div
        data-hero-cue
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center opacity-0"
      >
        <p className="label flex items-center gap-3">
          <span className="inline-block h-8 w-px bg-gradient-to-b from-transparent to-gold" />
          Role para girar as peças
        </p>
      </div>
    </section>
  );
}
