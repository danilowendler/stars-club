import type { Metadata, Viewport } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://thestarsclub.com.br'),
  title: {
    default: 'The Stars Club — Streetwear autoral do Brasil',
    template: '%s · The Stars Club',
  },
  description:
    'Camisetas, moletom, tricô e jeans em cápsulas pequenas. Frete grátis acima de R$ 599, até 3x sem juros e 5% de desconto no Pix.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'The Stars Club',
    title: 'The Stars Club — Streetwear autoral do Brasil',
    description:
      'Cada peça guarda uma imagem inteira nas costas. Veja a frente e o verso de cada uma.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07070b',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${instrument.variable}`}>
      <body>
        <a
          href="#pecas"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:bg-bone focus:px-5 focus:py-3 focus:text-ink"
        >
          Pular para as peças
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
