import { brl, FREE_SHIPPING_FROM, INSTALLMENTS } from '@/lib/products';

const items = [
  {
    title: 'Frete grátis',
    body: `Acima de ${brl(FREE_SHIPPING_FROM)} o envio sai por nossa conta, para todo o Brasil.`,
    icon: (
      <path
        d="M2 6h11v9H2zM13 9h4l3 3v3h-7zM6.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: '5% OFF no Pix',
    body: 'Pagando à vista no Pix o desconto entra direto no fechamento do pedido.',
    icon: (
      <path
        d="m11 2 9 9-9 9-9-9 9-9Zm0 6.5L8.5 11 11 13.5 13.5 11 11 8.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: `Até ${INSTALLMENTS}x sem juros`,
    body: 'Parcele no cartão em até três vezes, sem acréscimo nenhum no valor.',
    icon: (
      <path
        d="M2 6h18v11H2zM2 10h18M6 14h4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Troca sem susto',
    body: 'Tamanho errado acontece. A política de trocas e devoluções está aberta no site.',
    icon: (
      <path
        d="M3 11a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M19 11a8 8 0 0 1-13.7 5.7L2 14M2 18v-4h4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Assurances() {
  return (
    <section
      id="atendimento"
      aria-labelledby="atendimento-title"
      className="relative px-6 py-28 sm:px-10 sm:py-36"
    >
      <div className="mx-auto max-w-[110rem]">
        <p className="label mb-5" data-reveal>
          [ Antes de fechar ]
        </p>
        <h2
          id="atendimento-title"
          className="display mb-16 max-w-[18ch] text-bone"
          style={{ fontSize: 'var(--step-3)' }}
          data-reveal
        >
          O que já está resolvido.
        </h2>

        <div
          className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
          data-reveal
          data-reveal-children
        >
          {items.map((it) => (
            <div key={it.title} className="bg-ink p-8 sm:p-10">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                aria-hidden="true"
                className="mb-8 text-gold"
              >
                {it.icon}
              </svg>
              <h3 className="mb-3 text-bone" style={{ fontSize: 'var(--step-0)' }}>
                {it.title}
              </h3>
              <p className="text-dim" style={{ fontSize: 'var(--step--1)' }}>
                {it.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-dim" style={{ fontSize: 'var(--step--1)' }} data-reveal>
          Dúvida sobre caimento ou tamanho? Chame no{' '}
          <a
            href="https://instagram.com/thestarsclub___"
            className="cursor-pointer border-b border-gold/40 text-bone transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            @thestarsclub___
          </a>{' '}
          — a gente responde por lá.
        </p>
      </div>
    </section>
  );
}
