'use client';

import Image from 'next/image';
import { brl, products, type Product } from '@/lib/products';

function Card({ p, priority }: { p: Product; priority: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <a
        href={p.href}
        className="relative block cursor-pointer overflow-hidden bg-surface/40"
        style={{ aspectRatio: '4 / 5' }}
      >
        {/* front */}
        <Image
          src={p.front}
          alt={`${p.name} — frente`}
          fill
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
          priority={priority}
          className={`object-contain p-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            p.back
              ? 'group-hover:-translate-y-1 group-hover:opacity-0 group-focus-visible:opacity-0'
              : 'group-hover:scale-[1.04]'
          }`}
        />

        {/* back — only for the garments we have both sides of */}
        {p.back && (
          <Image
            src={p.back}
            alt=""
            fill
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
            className="translate-y-1 object-contain p-6 opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          />
        )}

        <span className="label absolute top-4 left-4 text-dim/70">{p.capsule}</span>

        {p.back && (
          <span className="label absolute right-4 bottom-4 text-dim/0 transition-colors duration-300 group-hover:text-gold">
            Verso
          </span>
        )}
      </a>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-bone" style={{ fontSize: 'var(--step-0)' }}>
            <a href={p.href} className="cursor-pointer hover:text-gold">
              {p.name}
            </a>
          </h3>
          <p className="mt-1 text-dim" style={{ fontSize: 'var(--step--1)' }}>
            {p.sizes.join(' · ')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-bone" style={{ fontSize: 'var(--step-0)' }}>
            {brl(p.price)}
          </p>
          <p className="mt-1 text-dim" style={{ fontSize: 'var(--step--2)' }}>
            {brl(p.pix)} no Pix
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Collection() {
  return (
    <section id="pecas" aria-labelledby="pecas-title" className="relative px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[110rem]">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6" data-reveal data-reveal-children>
          <div>
            <p className="label mb-5">[ Todas as peças ]</p>
            <h2 id="pecas-title" className="display text-bone" style={{ fontSize: 'var(--step-3)' }}>
              Sete peças, três cápsulas.
            </h2>
          </div>
          <a
            href="https://thestarsclub.com.br/produtos/"
            className="label cursor-pointer border-b border-line pb-2 text-bone transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            Comprar na loja
          </a>
        </div>

        <div
          className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
          data-reveal
          data-reveal-children
        >
          {products.map((p, i) => (
            <Card key={p.id} p={p} priority={i < 3} />
          ))}
        </div>
      </div>
    </section>
  );
}
