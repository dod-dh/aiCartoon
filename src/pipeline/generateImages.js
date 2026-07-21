// 컷 프롬프트 → PNG. 캐릭터 시트를 레퍼런스로 첨부해 얼굴/화풍 고정.
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { env } from '../config.js';
import { ok, warn } from '../utils/log.js';
import { generatePanel as gemini } from '../providers/gemini.js';
import { generatePanel as pollinations } from '../providers/pollinations.js';

function pickProvider() {
  if (env.geminiApiKey) return gemini;
  if (env.fallbackImageProvider === 'pollinations') {
    warn('GEMINI_API_KEY 없음 → Pollinations 폴백 사용(얼굴 일관성 보장 안 됨).');
    return pollinations;
  }
  throw new Error('GEMINI_API_KEY가 필요합니다. .env를 설정하세요.');
}

export async function generateImages(prompts, dir) {
  const provider = pickProvider();
  const results = [];
  // 순차 실행: 무료 티어 RPM 보호 + 이전 컷을 다음 컷의 추가 레퍼런스로 넘길 수 있게.
  for (const { panel, prompt } of prompts) {
    const png = await provider(prompt); // Buffer
    const file = path.join(dir, 'panels', `panel-${String(panel).padStart(2, '0')}.png`);
    writeFileSync(file, png);
    ok(`컷 ${panel} → ${path.relative(dir, file)}`);
    results.push({ panel, file });
  }
  return results;
}
