// 컷들을 인스타 세로 규격으로 배치/합치기.
// 기본: 컷마다 1080x1350 프레임으로 저장(인스타 캐러셀 업로드용).
// 옵션: 하나의 긴 세로 스트립(strip.png)도 생성.
import path from 'node:path';
import sharp from 'sharp';
import { CANVAS } from '../config.js';
import { ok } from '../utils/log.js';

async function frame(srcBuf) {
  // 각 컷을 흰 배경 1080x1350 중앙에 contain 배치
  const resized = await sharp(srcBuf)
    .resize(CANVAS.width, CANVAS.height, { fit: 'contain', background: '#ffffff' })
    .png()
    .toBuffer();
  return resized;
}

export async function stitch(panelFiles, dir) {
  const framedDir = path.join(dir, 'insta');
  await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } }); // noop warmup
  const fs = await import('node:fs');
  fs.mkdirSync(framedDir, { recursive: true });

  const framed = [];
  for (const { panel, file } of panelFiles) {
    const buf = await frame(fs.readFileSync(file));
    const out = path.join(framedDir, `${String(panel).padStart(2, '0')}.png`);
    await sharp(buf).toFile(out);
    framed.push(out);
    ok(`인스타 컷 ${panel}`);
  }

  // 긴 세로 스트립(미리보기용)
  const buffers = framed.map((f) => fs.readFileSync(f));
  const strip = path.join(dir, 'strip.png');
  await sharp({
    create: { width: CANVAS.width, height: CANVAS.height * framed.length, channels: 3, background: '#fff' },
  })
    .composite(buffers.map((input, i) => ({ input, top: CANVAS.height * i, left: 0 })))
    .png()
    .toFile(strip);

  ok(`세로 스트립: ${path.relative(dir, strip)}`);
  return framedDir;
}
