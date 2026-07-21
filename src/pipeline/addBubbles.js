// 컷 이미지 위에 말풍선(대사) 합성.
// 1차 구현: SVG로 말풍선을 그려 sharp로 오버레이. 폰트/위치는 향후 고도화(roadmap 참고).
import path from 'node:path';
import sharp from 'sharp';
import { ok } from '../utils/log.js';

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

// 아주 단순한 상단 배치 말풍선(줄바꿈 미고려). 실제 감성 배치는 roadmap에서 개선.
function bubbleSvg(width, lines) {
  const pad = 24;
  const lh = 46;
  const boxH = lines.length * lh + pad * 2;
  const text = lines
    .map((t, i) => `<text x="${width / 2}" y="${pad + lh * (i + 1) - 12}" font-size="34"
      font-family="'Nanum Pen Script','Gaegu',sans-serif" text-anchor="middle" fill="#111">${escapeXml(t)}</text>`)
    .join('');
  return Buffer.from(
    `<svg width="${width}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="8" rx="28" ry="28" width="${width - 32}" height="${boxH - 16}"
        fill="white" stroke="#111" stroke-width="4"/>${text}
    </svg>`,
  );
}

export async function addBubbles(storyboard, dir) {
  const results = [];
  for (const p of storyboard.panels) {
    const src = path.join(dir, 'panels', `panel-${String(p.panel).padStart(2, '0')}.png`);
    const dst = path.join(dir, 'panels', `panel-${String(p.panel).padStart(2, '0')}-bubble.png`);
    const lines = (p.dialogue || []).map((d) => d.text);

    if (!lines.length) {
      await sharp(src).toFile(dst);
    } else {
      const meta = await sharp(src).metadata();
      const svg = bubbleSvg(meta.width, lines);
      await sharp(src).composite([{ input: svg, top: 20, left: 0 }]).toFile(dst);
    }
    ok(`말풍선 합성 컷 ${p.panel}`);
    results.push({ panel: p.panel, file: dst });
  }
  return results;
}
