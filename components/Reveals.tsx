'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Page-level entrance choreography (Krehel: opacity + lift + a touch of
 * depth blur, visible staggering). Initial state lives in CSS so nothing
 * flashes before GSAP takes over.
 */
export default function Reveals() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set('[data-reveal]', { opacity: 1, clearProps: 'transform,filter' });
      return;
    }

    const cheap = window.matchMedia('(max-width: 768px)').matches;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        const stagger = el.hasAttribute('data-reveal-children');
        const targets = stagger ? Array.from(el.children) : el;

        if (stagger) gsap.set(el, { opacity: 1 });

        gsap.fromTo(
          targets,
          {
            opacity: 0,
            y: 26,
            filter: cheap ? 'none' : 'blur(7px)',
          },
          {
            opacity: 1,
            y: 0,
            filter: 'none',
            duration: 0.95,
            ease: 'power3.out',
            stagger: stagger ? 0.075 : 0,
            scrollTrigger: { trigger: el, start: 'top 84%', once: true },
            onComplete: () => gsap.set(targets, { clearProps: 'filter,willChange' }),
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
