'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TEXT =
  'Cada cápsula começa por uma imagem: um píer ao anoitecer, o mostrador de um relógio, um gesto com a mão. A frente guarda o segredo. O verso conta a história inteira.';

export default function Manifesto() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>('[data-words]');
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(el.querySelectorAll('span'), { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('span'),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.5,
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            end: 'bottom 55%',
            scrub: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="manifesto-title"
      className="relative px-6 py-32 sm:px-10 sm:py-44"
    >
      <div className="mx-auto max-w-[110rem]">
        <h2 id="manifesto-title" className="label mb-14">
          [ O método ]
        </h2>

        <p
          data-words
          aria-label={TEXT}
          className="display max-w-[24ch] text-balance text-bone"
          style={{ fontSize: 'var(--step-3)', lineHeight: 1.12 }}
        >
          {TEXT.split(' ').map((w, i) => (
            <span key={`${w}-${i}`} aria-hidden="true">
              {w}{' '}
            </span>
          ))}
        </p>

        <p
          className="mt-14 max-w-[42ch] text-dim"
          style={{ fontSize: 'var(--step-0)' }}
        >
          É por isso que aqui as peças giram. Role e veja a frente e o verso de cada uma, como você
          veria na mão.
        </p>
      </div>
    </section>
  );
}
