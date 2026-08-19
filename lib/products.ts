export type Product = {
  id: string;
  name: string;
  capsule: string;
  /** the line printed on the garment itself — the brand's own voice */
  inscription?: string;
  blurb: string;
  price: number;
  /** 5% off on Pix, exactly as the store applies it */
  pix: number;
  href: string;
  front: string;
  back?: string;
  /** width / height of the cutout, so the 3D panels keep true proportions */
  aspect: number;
  sizes: string[];
};

const STORE = 'https://thestarsclub.com.br/produtos';

export const products: Product[] = [
  {
    id: 'pier-tee',
    name: 'Pier Tee',
    capsule: 'La Jetée',
    inscription: 'Coucher du Soleil',
    blurb:
      'O píer ao anoitecer pintado nas costas — barcos, lampiões e um céu inteiro de estrelas. Na frente, só a assinatura no peito.',
    price: 189.9,
    pix: 180.41,
    href: `${STORE}/pier-tee-2c6r4/`,
    front: '/tex/pier-tee-front.webp',
    back: '/tex/pier-tee-back.webp',
    aspect: 874 / 870,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'watches-tee',
    name: 'Watches Tee',
    capsule: 'Watches',
    inscription: "Rien n'est plus précieux que le temps",
    blurb:
      'Mostradores sobrepostos ocupando as costas inteiras, com a frase da cápsula fechando embaixo: nada é mais precioso que o tempo.',
    price: 189.9,
    pix: 180.41,
    href: `${STORE}/watches-tee-xm4f7/`,
    front: '/tex/watches-tee-front.webp',
    back: '/tex/watches-tee-back.webp',
    aspect: 874 / 870,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'stars-tee',
    name: 'We See The Stars Tee',
    capsule: 'Stars',
    inscription: 'We see the stars',
    blurb:
      'Manuscrito no peito, olhar aberto nas costas. A peça que dá nome ao clube — e a razão de você estar olhando para cima.',
    price: 189.9,
    pix: 180.41,
    href: `${STORE}/we-see-the-stars-tee-hcjgi/`,
    front: '/tex/stars-tee-front.webp',
    back: '/tex/stars-tee-back.webp',
    aspect: 957 / 952,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'boxy-tee',
    name: 'HandSign Boxy Tee',
    capsule: 'HandSign',
    inscription: 'HandSign',
    blurb:
      'Modelagem boxy em preto lavado. O gesto da casa impresso grande nas costas, em alto contraste.',
    price: 189.9,
    pix: 180.41,
    href: `${STORE}/handsign-boxy-tee-1ycp0/`,
    front: '/tex/boxy-tee-front.webp',
    back: '/tex/boxy-tee-back.webp',
    aspect: 992 / 866,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'handsign-sweater',
    name: 'HandSign Sweater',
    capsule: 'HandSign',
    blurb: 'Suéter de gola careca em tricô pesado, com o gesto da casa tomando o peito inteiro.',
    price: 359.9,
    pix: 341.91,
    href: `${STORE}/handsign-sweater-gva6s/`,
    front: '/tex/handsign-sweater.webp',
    aspect: 803 / 756,
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: 'baggy-jeans',
    name: 'HandSign Baggy Jeans',
    capsule: 'HandSign',
    blurb: 'Jeans baggy em lavagem clara, barra desfiada e o gesto estampado ao longo da perna.',
    price: 399.9,
    pix: 379.91,
    href: `${STORE}/handsign-baggy-jeans-d9o71/`,
    front: '/tex/baggy-jeans.webp',
    aspect: 823 / 1125,
    sizes: ['38', '40', '42', '44', '46'],
  },
  {
    id: 'watches-hoodie',
    name: 'Watches Hoodie',
    capsule: 'Watches',
    inscription: "Rien n'est plus précieux que le temps",
    blurb:
      'Moletom com capuz em preto lavado e estampa tonal de mostradores — aparece na luz, some na sombra.',
    price: 419.9,
    pix: 398.91,
    href: `${STORE}/watches-hoodie-vw6ox/`,
    front: '/tex/watches-hoodie.webp',
    aspect: 898 / 923,
    sizes: ['P', 'M', 'G', 'GG'],
  },
];

/** Only garments we photographed on both sides earn a place in the 3D showcase. */
export const showcase = products.filter((p): p is Product & { back: string } => Boolean(p.back));

export const FREE_SHIPPING_FROM = 599;
export const INSTALLMENTS = 3;

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
