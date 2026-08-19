/**
 * Product image pipeline.
 *
 *   node scripts/prepare-products.js
 *
 * Reads flat-lay photos from source-assets/originals/, lifts each garment off
 * its white studio background, and writes:
 *   source-assets/cutouts/*.png   full-resolution masters with alpha
 *   public/tex/*.webp             the 820px textures the site actually loads
 *
 * The tricky part is that a white tee on a white background differs from its
 * backdrop by as little as 10 levels, so a global threshold erases the shirt.
 * Instead we flood-fill inward from the frame (the background is the only
 * region touching the border), then adapt the threshold to each garment's own
 * contrast so the soft drop shadow goes too without eating pale cotton.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'source-assets/originals';
const MASTERS = 'source-assets/cutouts';
const TEX = 'public/tex';
const TEX_SIZE = 820;

function boxBlur(src, W, H, r) {
  const tmp = new Float32Array(W * H);
  const dst = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += src[y * W + Math.min(W - 1, Math.max(0, x))];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = s / (2 * r + 1);
      s += src[y * W + Math.min(W - 1, x + r + 1)] - src[y * W + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < W; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
    for (let y = 0; y < H; y++) {
      dst[y * W + x] = s / (2 * r + 1);
      s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x];
    }
  }
  return dst;
}

/** Marks every pixel reachable from the frame that is light and near-neutral. */
function floodBackground(lum, sat, W, H, minL) {
  const N = W * H;
  const bg = new Uint8Array(N);
  const st = [];
  const push = (i) => {
    if (!bg[i] && lum[i] >= minL && sat[i] <= 18) {
      bg[i] = 1;
      st.push(i);
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (st.length) {
    const i = st.pop();
    const x = i % W;
    const y = (i / W) | 0;
    if (x + 1 < W) push(i + 1);
    if (x > 0) push(i - 1);
    if (y + 1 < H) push(i + W);
    if (y > 0) push(i - W);
  }
  return bg;
}

/** Keeps the largest foreground blob, dropping compression speckle at the edges. */
function largestComponent(bg, W, H) {
  const N = W * H;
  const lab = new Int32Array(N).fill(-1);
  let best = -1;
  let bestSize = 0;
  let cur = 0;
  for (let s = 0; s < N; s++) {
    if (bg[s] || lab[s] >= 0) continue;
    const q = [s];
    lab[s] = cur;
    let n = 0;
    while (q.length) {
      const i = q.pop();
      n++;
      const x = i % W;
      const y = (i / W) | 0;
      const nb = [x + 1 < W ? i + 1 : -1, x > 0 ? i - 1 : -1, y + 1 < H ? i + W : -1, y > 0 ? i - W : -1];
      for (const j of nb) if (j >= 0 && !bg[j] && lab[j] < 0) { lab[j] = cur; q.push(j); }
    }
    if (n > bestSize) { bestSize = n; best = cur; }
    cur++;
  }
  const fg = new Float32Array(N);
  for (let i = 0; i < N; i++) fg[i] = lab[i] === best ? 255 : 0;
  return fg;
}

async function cut(file) {
  const { data, info } = await sharp(path.join(SRC, file)).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const ch = info.channels;
  const N = W * H;

  const lum = new Float32Array(N);
  const sat = new Float32Array(N);
  for (let i = 0, p = 0; i < N; i++, p += ch) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    lum[i] = r * 0.299 + g * 0.587 + b * 0.114;
    sat[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }

  const border = [];
  for (let x = 0; x < W; x++) { border.push(lum[x]); border.push(lum[(H - 1) * W + x]); }
  for (let y = 0; y < H; y++) { border.push(lum[y * W]); border.push(lum[y * W + W - 1]); }
  border.sort((a, b) => a - b);
  const bgL = border[border.length >> 1];

  // pass 1 — strict, just to measure how dark this garment actually is
  const first = largestComponent(floodBackground(lum, sat, W, H, bgL - 6), W, H);
  const vals = [];
  for (let i = 0; i < N; i++) if (first[i]) vals.push(lum[i]);
  vals.sort((a, b) => a - b);
  const garmentL = vals.length ? vals[vals.length >> 1] : 0;

  // pass 2 — threshold scaled to this garment's contrast, removing the shadow
  const floorL = bgL - 0.35 * Math.max(0, bgL - garmentL);
  const fg = largestComponent(floodBackground(lum, sat, W, H, floorL), W, H);

  // erode a pixel to bite off the light halo, then feather the edge
  const er = new Float32Array(N);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!fg[i]) { er[i] = 0; continue; }
      let m = 255;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          if (!fg[ny * W + nx]) m = 0;
        }
      }
      er[i] = m;
    }
  }
  const soft = boxBlur(er, W, H, 1);

  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const p = i * ch;
    out[i * 4] = data[p];
    out[i * 4 + 1] = data[p + 1];
    out[i * 4 + 2] = data[p + 2];
    out[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(soft[i])));
  }

  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (soft[y * W + x] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 10;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
  const box = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };

  const base = file.replace(/\.[a-z]+$/i, '');
  const master = sharp(out, { raw: { width: W, height: H, channels: 4 } }).extract(box);
  await master.clone().png({ compressionLevel: 9 }).toFile(path.join(MASTERS, `${base}.png`));
  await master
    .clone()
    .resize({ width: TEX_SIZE, height: TEX_SIZE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 })
    .toFile(path.join(TEX, `${base}.webp`));

  console.log(
    `${base.padEnd(24)} bg ${bgL.toFixed(0)}  garment ${garmentL.toFixed(0)}  ` +
      `threshold ${floorL.toFixed(0)}  ->  ${box.width}x${box.height}  ` +
      `aspect ${(box.width / box.height).toFixed(3)}`,
  );
}

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error(`Missing ${SRC}/ — put the flat-lay photos there first.`);
    process.exit(1);
  }
  fs.mkdirSync(MASTERS, { recursive: true });
  fs.mkdirSync(TEX, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
  if (!files.length) {
    console.error(`No images in ${SRC}/`);
    process.exit(1);
  }
  for (const f of files) await cut(f);
  console.log(
    `\nDone: ${files.length} garments. Copy the printed aspect into lib/products.ts ` +
      `when you add a new piece.`,
  );
})();
