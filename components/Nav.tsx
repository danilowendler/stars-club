'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const links = [
  { href: '#showcase', label: 'A coleção' },
  { href: '#pecas', label: 'Todas as peças' },
  { href: '#atendimento', label: 'Atendimento' },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      ref={nav}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? 'border-b border-line bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Principal"
        className="mx-auto flex h-16 max-w-[110rem] items-center justify-between gap-6 px-6 sm:h-20 sm:px-10"
      >
        <a href="#top" className="flex cursor-pointer items-center gap-3" aria-label="The Stars Club — início">
          <Image
            src="/brand/wordmark.png"
            alt=""
            width={120}
            height={51}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="label cursor-pointer text-dim transition-colors duration-200 hover:text-bone"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <a
            href="https://thestarsclub.com.br/produtos/"
            className="label hidden cursor-pointer border border-line px-5 py-2.5 text-bone transition-colors duration-200 hover:border-gold hover:text-gold sm:inline-block"
          >
            Ir para a loja
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="cursor-pointer p-2 text-bone md:hidden"
          >
            <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              {open ? (
                <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              ) : (
                <path d="M3 7h16M3 15h16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        id="menu-mobile"
        hidden={!open}
        className="border-t border-line bg-ink/95 backdrop-blur-xl md:hidden"
      >
        <ul className="flex flex-col px-6 py-4">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="label block cursor-pointer py-4 text-bone"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://thestarsclub.com.br/produtos/"
              className="label block cursor-pointer py-4 text-gold"
            >
              Ir para a loja
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
