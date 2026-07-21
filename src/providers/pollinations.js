// 폴백 이미지 제공자: Pollinations (API 키 불필요, 무료).
// 주의: 레퍼런스 이미지 기반 얼굴 고정은 지원하지 않으므로 프리뷰/테스트용으로만 사용.
import { CANVAS } from '../config.js';

export async function generatePanel(prompt) {
  const q = encodeURIComponent(prompt.replace(/\[[A-Z]+\]/g, ' ').slice(0, 900));
  const url =
    `https://image.pollinations.ai/prompt/${q}` +
    `?width=${CANVAS.width}&height=${CANVAS.height}&nologo=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations 실패: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
