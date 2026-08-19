import Image from 'next/image';

const socials = [
  { label: 'Instagram', handle: '@thestarsclub___', href: 'https://instagram.com/thestarsclub___' },
  { label: 'TikTok', handle: '@thestarsclub___', href: 'https://tiktok.com/@thestarsclub___' },
];

const shop = [
  { label: 'Todos os produtos', href: 'https://thestarsclub.com.br/produtos/' },
  { label: 'Camisetas', href: 'https://thestarsclub.com.br/produtos/' },
  { label: 'Hoodies e suéteres', href: 'https://thestarsclub.com.br/produtos/' },
  { label: 'Calças', href: 'https://thestarsclub.com.br/produtos/' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line px-6 pt-24 pb-12 sm:px-10">
      <div className="mx-auto max-w-[110rem]">
        {/* the closing statement, restated at full size */}
        <p
          className="display max-w-[16ch] text-balance text-bone"
          style={{ fontSize: 'var(--step-4)' }}
          data-reveal
        >
          Olhe para cima.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5" data-reveal>
          <a
            href="https://thestarsclub.com.br/produtos/"
            className="group inline-flex cursor-pointer items-center gap-3 bg-bone px-8 py-4 text-ink transition-colors duration-200 hover:bg-gold"
            style={{ fontSize: 'var(--step--1)' }}
          >
            <span className="font-medium tracking-wide">Comprar a coleção</span>
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
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <hr className="rule my-16" />

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/brand/wordmark.png"
              alt="The Stars Club"
              width={400}
              height={170}
              className="h-8 w-auto"
            />
            <p className="mt-6 max-w-[28ch] text-dim" style={{ fontSize: 'var(--step--1)' }}>
              Streetwear autoral do Brasil, em cápsulas pequenas.
            </p>
          </div>

          <nav aria-labelledby="footer-loja">
            <h2 id="footer-loja" className="label mb-6">
              Loja
            </h2>
            <ul className="space-y-3">
              {shop.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="cursor-pointer text-dim transition-colors duration-200 hover:text-bone"
                    style={{ fontSize: 'var(--step--1)' }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-ajuda">
            <h2 id="footer-ajuda" className="label mb-6">
              Ajuda
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://thestarsclub.com.br/trocas-e-devolucoes/"
                  className="cursor-pointer text-dim transition-colors duration-200 hover:text-bone"
                  style={{ fontSize: 'var(--step--1)' }}
                >
                  Trocas e devoluções
                </a>
              </li>
              <li>
                <a
                  href="https://thestarsclub.com.br/"
                  className="cursor-pointer text-dim transition-colors duration-200 hover:text-bone"
                  style={{ fontSize: 'var(--step--1)' }}
                >
                  Minha conta
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-social">
            <h2 id="footer-social" className="label mb-6">
              Onde a gente está
            </h2>
            <ul className="space-y-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="group inline-flex cursor-pointer items-baseline gap-3"
                    style={{ fontSize: 'var(--step--1)' }}
                  >
                    <span className="text-bone transition-colors duration-200 group-hover:text-gold">
                      {s.label}
                    </span>
                    <span className="text-dim">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4">
          <p className="label">© {new Date().getFullYear()} The Stars Club</p>
          <p className="label">We see the stars</p>
        </div>
      </div>
    </footer>
  );
}
