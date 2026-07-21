// banana가 그린 글자 없는 그림 위에 말풍선(대사) + 효과음을 코드로 합성한다.
// 원본(panels/panel-NN.png)은 보존하고, 결과는 final/NN.png 로 저장 → 말풍선만 재합성 가능(무과금).
import path from 'node:path';
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { ok, warn } from '../utils/log.js';

const FONT = "Malgun Gothic, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

function esc(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

// 글자 수 기준 단순 줄바꿈(공백 우선, 긴 토큰은 강제 분할)
function wrap(text, maxChars) {
  const out = [];
  for (const raw of text.split('\n')) {
    let cur = '';
    for (const word of raw.split(' ')) {
      const cand = cur ? cur + ' ' + word : word;
      if (cand.length > maxChars && cur) {
        out.push(cur);
        cur = word;
      } else cur = cand;
    }
    if (cur) out.push(cur);
  }
  return out.flatMap((l) => (l.length > maxChars ? l.match(new RegExp(`.{1,${maxChars}}`, 'g')) : [l]));
}

function bubbleSvg(W, H, dialogues, sfx) {
  const fs = Math.max(22, Math.round(W * 0.04)); // 폰트 크기
  const lh = Math.round(fs * 1.4);
  const padX = Math.round(fs * 0.7);
  const padY = Math.round(fs * 0.55);
  const bw = Math.round(W * 0.66); // 말풍선 폭
  const maxChars = Math.max(6, Math.floor((bw - padX * 2) / (fs * 0.98)));
  const tail = Math.round(fs * 0.6);

  let y = Math.round(H * 0.03);
  const parts = [];

  dialogues.forEach((d, i) => {
    const lines = wrap(d.text, maxChars);
    const bh = lines.length * lh + padY * 2;
    // 화자가 둘일 때 좌/우로 나눠 배치
    const alignRight = dialogues.length > 1 && i % 2 === 1;
    const x = alignRight ? W - bw - Math.round(W * 0.05) : Math.round(W * 0.05);
    const cx = x + bw / 2;

    parts.push(`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${Math.round(fs * 0.9)}"
      fill="white" stroke="#1a1a1a" stroke-width="${Math.max(3, Math.round(fs * 0.11))}"/>`);
    // 꼬리 (아래로)
    const tx = alignRight ? x + bw * 0.7 : x + bw * 0.3;
    parts.push(`<path d="M ${tx - tail} ${y + bh - 2} L ${tx + tail} ${y + bh - 2} L ${tx} ${y + bh + tail} Z"
      fill="white" stroke="#1a1a1a" stroke-width="${Math.max(3, Math.round(fs * 0.11))}" stroke-linejoin="round"/>`);
    lines.forEach((ln, li) => {
      parts.push(`<text x="${cx}" y="${y + padY + lh * (li + 1) - Math.round(lh * 0.28)}"
        font-family="${FONT}" font-size="${fs}" fill="#1a1a1a" text-anchor="middle">${esc(ln)}</text>`);
    });
    y += bh + tail + Math.round(H * 0.02);
  });

  // 효과음: 하단 좌측에 살짝 기울여
  (sfx || []).forEach((s, i) => {
    const sx = Math.round(W * 0.08) + i * Math.round(W * 0.02);
    const sy = Math.round(H * (0.78 + i * 0.06));
    const sfs = Math.round(fs * 1.25);
    parts.push(`<text x="${sx}" y="${sy}" font-family="${FONT}" font-size="${sfs}" font-weight="bold"
      fill="#1a1a1a" stroke="white" stroke-width="${Math.round(sfs * 0.12)}" paint-order="stroke"
      transform="rotate(-8 ${sx} ${sy})">${esc(s)}</text>`);
  });

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`);
}

export async function addBubbles(storyboard, dir) {
  const finalDir = path.join(dir, 'final');
  mkdirSync(finalDir, { recursive: true });
  const results = [];

  for (const p of storyboard.panels) {
    const nn = String(p.panel).padStart(2, '0');
    const src = path.join(dir, 'panels', `panel-${nn}.png`);
    const dst = path.join(finalDir, `${nn}.png`);
    if (!existsSync(src)) {
      warn(`원본 없음, 건너뜀: panels/panel-${nn}.png`);
      continue;
    }
    const dialogues = (p.dialogue || []).filter((d) => d && d.text);
    const sfx = (Array.isArray(p.sfx) ? p.sfx : p.sfx ? [p.sfx] : []).filter(Boolean);

    const img = sharp(src);
    const meta = await img.metadata();
    if (!dialogues.length && !sfx.length) {
      await img.toFile(dst);
    } else {
      const svg = bubbleSvg(meta.width, meta.height, dialogues, sfx);
      await img.composite([{ input: svg, top: 0, left: 0 }]).toFile(dst);
    }
    ok(`말풍선 합성 → final/${nn}.png`);
    results.push({ panel: p.panel, file: dst });
  }
  return results;
}
