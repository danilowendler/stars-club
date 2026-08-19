# The Stars Club — reformulação

Front-end de marca para [thestarsclub.com.br](https://thestarsclub.com.br/), construído com Next.js 16, React 19, Tailwind v4, React Three Fiber, GSAP ScrollTrigger e Lenis.

Todo o conteúdo — logo, favicon, fotos e preços — veio do site atual. O checkout continua na loja: cada CTA leva para a página real do produto na Nuvemshop.

## Rodando

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

## A direção

**Arquétipo:** Editorial Luxury sobre um palco noturno. A escolha veio das próprias peças — as estampas citam cinema francês (`LA JETÉE`, `COUCHER DU SOLEIL`), relógios e um céu de estrelas.

**Paleta** (`app/globals.css`) — monocromática com UM acento merecido:

| Token | Valor | Por quê |
|---|---|---|
| `--color-ink` | `#07070b` | preto azulado de céu noturno, nunca `#000` puro |
| `--color-bone` | `#f4f1ea` | branco quente, o mesmo algodão das camisetas |
| `--color-gold` | `#d7b56d` | o dourado das estrelas e lampiões da estampa "Coucher du Soleil" e da cápsula Watches |

O ouro fica abaixo de 8% da tela: marca o CTA, os hovers e o rim light da peça 3D. Contraste medido sobre o fundo: texto secundário 7,1:1, ouro 10,3:1 — ambos acima de 4,5:1.

**Tipografia:** Instrument Serif para display (registro de cartela de cinema) e Inter para corpo e interface. As micro-legendas em caixa alta com tracking largo são cópia direta do que está impresso nas roupas.

**Identidade de movimento:** Premium — zero overshoot, easing `cubic-bezier(0.22, 1, 0.36, 1)`, três durações (180 / 480 / 900ms). Camadas Krehel na página, Kowalski nos controles.

> Nota: o gerador de design system da skill sugeriu Cormorant/Montserrat + Liquid Glass. Descartado de propósito: é o default genérico de moda, e Liquid Glass é marcado como performance ruim — conflitaria com o WebGL, que é onde vale gastar o orçamento.

## O momento assinatura

Um único `<Canvas>` fixo atrás da página inteira (`components/scene/Scene.tsx`) carrega as estrelas e as peças. Um set-piece de WebGL por página.

**A peça 3D** (`components/scene/Garment.tsx`) é feita de **dois painéis curvos que se afastam um do outro** — a frente estufando na direção de quem olha, o verso na direção oposta. Juntos fecham um volume real, então girar o grupo gira um objeto sólido: você vê o peito, a peça atravessa a própria espessura e a estampa das costas chega. Cada painel usa culling `FrontSide`/`BackSide`, então só um desenha por vez e não há transparência para ordenar.

O deslocamento é um único bojo radial que vai a zero em todas as bordas (bojo com quina lê como papel dobrado, não como tecido). A malha respira com ruído senoidal e um rim light dourado recorta a silhueta contra o céu.

A rolagem dirige tudo por um store mutável (`lib/scene-state.ts`) que o ScrollTrigger escreve e o `useFrame` lê — nunca `setState` a 60fps.

**O índice do texto e o do 3D usam a mesma fórmula.** Se um deles ganhar viés, a legenda descreve uma peça enquanto outra está no palco.

## Acessibilidade e limites

- `prefers-reduced-motion`: Lenis não sobe, os pins e o scrub não existem, a peça fica parada de frente. Verificado.
- Sem WebGL: `<html class="no-webgl">` e a seção cai para as fotos planas.
- Um `h1`, hierarquia de headings contínua, `lang="pt-BR"`, canvas com `aria-hidden`, foco visível em ouro, skip link.
- Sem overflow horizontal a 375px. No celular a peça sobe para cima do texto em vez de ficar atrás dele.

## Imagens de produto

As fotos vêm em fundo branco de estúdio; o site precisa delas recortadas para a peça flutuar no escuro.

```bash
npm run prepare-products
```

Lê `source-assets/originals/`, escreve os masters em `source-assets/cutouts/` e as texturas de 820px em `public/tex/`.

O detalhe difícil: uma camiseta branca sobre fundo branco difere do fundo em ~10 níveis, então limiar global apaga a camiseta. O script faz flood fill a partir da moldura (só o fundo encosta na borda) e depois adapta o limiar ao contraste de cada peça — 250 para algodão claro, 171 para moletom preto — o que remove também a sombra projetada sem comer o tecido.

Ao adicionar uma peça: nomeie `nome-front.webp` / `nome-back.webp` (**frente = logo pequeno no peito; verso = estampa grande**), rode o script e copie o `aspect` impresso para `lib/products.ts`. Só peças com os dois lados entram no showcase 3D.

## Estrutura

```
app/            layout, página, tokens de design
components/     seções (Hero, Manifesto, Showcase, Collection, …)
components/scene/  o Canvas único: Starfield + Garment
lib/            dados dos produtos e o store de scroll
scripts/        pipeline de recorte das fotos
source-assets/  fotos originais e masters com alpha (não vão para produção)
```
