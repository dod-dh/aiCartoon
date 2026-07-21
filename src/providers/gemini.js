// Gemini 2.5 Flash Image (Nano Banana) 이미지 생성
// 캐릭터 시트(characters.png)를 인라인 이미지로 함께 전달해 얼굴/화풍을 고정한다.
import { readFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { env, paths } from '../config.js';

let _client, _sheetPart;
function client() {
  return (_client ??= new GoogleGenAI({ apiKey: env.geminiApiKey }));
}
function sheetPart() {
  return (_sheetPart ??= {
    inlineData: {
      mimeType: 'image/png',
      data: readFileSync(paths.referenceSheet).toString('base64'),
    },
  });
}

/**
 * @param {string} prompt
 * @param {Buffer[]} [extraRefs]  이전 컷 등 추가 레퍼런스(선택)
 * @returns {Promise<Buffer>} PNG
 */
export async function generatePanel(prompt, extraRefs = []) {
  const parts = [
    sheetPart(),
    ...extraRefs.map((buf) => ({
      inlineData: { mimeType: 'image/png', data: buf.toString('base64') },
    })),
    { text: prompt },
  ];

  const res = await client().models.generateContent({
    model: env.imageModel,
    contents: [{ role: 'user', parts }],
  });

  const out = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (!out) throw new Error('이미지 응답이 비었습니다: ' + JSON.stringify(res).slice(0, 300));
  return Buffer.from(out.data, 'base64');
}
