// 캐릭터 시트를 레퍼런스로 준비한다.
// 매 컷: 전체 시트(화풍/공통 기준) + 등장 캐릭터별 크롭(해당 얼굴 집중)을 함께 보낸다.
// 시트는 좌(모모)/우(무무) 2열 구조 → 절반으로 크롭해 캐릭터별 참조를 만든다.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { paths } from '../config.js';

let _full = null;
let _crops = null;

async function ensure() {
  if (_full) return;
  _full = readFileSync(paths.referenceSheet);
  const { width: W, height: H } = await sharp(_full).metadata();
  const half = Math.floor(W / 2);
  const momo = await sharp(_full).extract({ left: 0, top: 0, width: half, height: H }).png().toBuffer();
  const mumu = await sharp(_full).extract({ left: half, top: 0, width: W - half, height: H }).png().toBuffer();
  _crops = { momo, mumu };
}

/**
 * 이 컷에 넣을 레퍼런스 이미지 버퍼 배열.
 * [전체 시트, (등장 캐릭터별 크롭...)]
 * @param {string[]} keys 등장 캐릭터 키
 * @returns {Promise<Buffer[]>}
 */
export async function referencesFor(keys = []) {
  await ensure();
  const refs = [_full];
  for (const k of keys) if (_crops[k]) refs.push(_crops[k]);
  return refs;
}
