// Gemini 텍스트 모델로 비트 → 콘티(JSON) 확장.
// JSON 강제 출력(responseMimeType)으로 파싱 안정성을 높인다.
import { GoogleGenAI } from '@google/genai';
import { env } from '../config.js';
import { warn } from '../utils/log.js';

let _client;
function client() {
  if (!env.geminiTextApiKey) throw new Error('GEMINI_TEXT_API_KEY(또는 GEMINI_API_KEY)가 필요합니다. 또는 SCRIPT_PROVIDER=manual.');
  if (!env.textKeyIsSeparate) {
    warn('대본이 이미지 키(결제 프로젝트)로 호출됩니다 → 소액 과금될 수 있음. 무료로 쓰려면 GEMINI_TEXT_API_KEY(결제 없는 키)를 설정하세요.');
  }
  return (_client ??= new GoogleGenAI({ apiKey: env.geminiTextApiKey }));
}

export async function expandWithGemini({ episode, bible, systemPrompt }) {
  const userMsg = [
    '## 캐릭터 바이블(JSON)',
    '```json',
    JSON.stringify(bible, null, 2),
    '```',
    '',
    '## 이번 에피소드',
    '```json',
    JSON.stringify(
      { id: episode.id, meta: episode.meta, logline: episode.logline, beats: episode.beats, notes: episode.notes },
      null,
      2,
    ),
    '```',
    '',
    '위 비트를 콘티로 확장해서 storyboard JSON만 출력해줘. 설명 문장은 넣지 마.',
  ].join('\n');

  const res = await client().models.generateContent({
    model: env.scriptModel,
    contents: userMsg,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.9,
    },
  });

  const text = res.text;
  if (!text) throw new Error('콘티 생성 실패: 빈 응답');
  try {
    return JSON.parse(text);
  } catch {
    // 혹시 코드펜스가 섞이면 제거 후 재시도
    return JSON.parse(text.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim());
  }
}
