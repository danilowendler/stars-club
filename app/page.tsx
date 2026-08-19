import dynamic from 'next/dynamic';
import Loader from '@/components/Loader';
import Reveals from '@/components/Reveals';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Showcase from '@/components/Showcase';
import Collection from '@/components/Collection';
import Marquee from '@/components/Marquee';
import Assurances from '@/components/Assurances';
import Footer from '@/components/Footer';
import { products } from '@/lib/products';

// The WebGL layer never blocks first paint or the server-rendered content.
const Scene = dynamic(() => import('@/components/scene/Scene'));

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'The Stars Club',
  url: 'https://thestarsclub.com.br',
  description: 'Streetwear autoral do Brasil, em cápsulas pequenas.',
  sameAs: [
    'https://instagram.com/thestarsclub___',
    'https://tiktok.com/@thestarsclub___',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Coleção',
    itemListElement: products.map((p) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: p.name, description: p.blurb },
      price: p.price.toFixed(2),
      priceCurrency: 'BRL',
      url: p.href,
      availability: 'https://schema.org/InStock',
    })),
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Loader />
      <Scene />
      <Reveals />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Showcase />
        <Collection />
        <Marquee />
        <Assurances />
      </main>
      <Footer />
    </>
  );
}
