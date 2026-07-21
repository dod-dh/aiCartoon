// Gemini 텍스트 모델로 비트 → 콘티(JSON) 확장.
// JSON 강제 출력(responseMimeType)으로 파싱 안정성을 높인다.
import { GoogleGenAI } from '@google/genai';
import { env } from '../config.js';

let _client;
function client() {
  if (!env.geminiApiKey) throw new Error('GEMINI_API_KEY가 필요합니다(.env). 또는 SCRIPT_PROVIDER=manual.');
  return (_client ??= new GoogleGenAI({ apiKey: env.geminiApiKey }));
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
