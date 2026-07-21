// Gemini 이미지 생성 (Nano Banana Pro / 2.5-flash-image).
// 레퍼런스 이미지(전체 시트 + 캐릭터 크롭)를 프롬프트보다 먼저 배치해 얼굴/화풍을 강하게 고정한다.
import { GoogleGenAI } from '@google/genai';
import { env } from '../config.js';

let _client;
function client() {
  return (_client ??= new GoogleGenAI({ apiKey: env.geminiApiKey }));
}

/**
 * @param {string} prompt
 * @param {Buffer[]} refImages  레퍼런스 이미지 버퍼 배열(시트 + 크롭). 항상 프롬프트 앞에 첨부.
 * @returns {Promise<Buffer>} PNG
 */
export async function generatePanel(prompt, refImages = []) {
  const parts = [
    ...refImages.map((buf) => ({
      inlineData: { mimeType: 'image/png', data: buf.toString('base64') },
    })),
    { text: prompt },
  ];

  const res = await client().models.generateContent({
    model: env.imageModel,
    contents: [{ role: 'user', parts }],
    config: { imageConfig: { aspectRatio: env.aspectRatio } },
  });

  const out = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (!out) throw new Error('이미지 응답이 비었습니다: ' + JSON.stringify(res).slice(0, 300));
  return Buffer.from(out.data, 'base64');
}
