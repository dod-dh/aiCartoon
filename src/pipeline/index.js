// 파이프라인 오케스트레이터
//   대본 파싱 → 상세 콘티 생성 → 프롬프트 조립 → 이미지 생성(말풍선·효과음 포함, 세로 4:5)
// banana가 말풍선/대사/효과음까지 직접 그리므로 별도 합성/스트립 단계는 없다.
// 각 panel-NN.png 가 그대로 인스타 업로드용 최종본(여러 장 슬라이드).
import path from 'node:path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { paths } from '../config.js';
import { step, ok, warn, die } from '../utils/log.js';
import { parseScript } from './parseScript.js';
import { writeStoryboard } from './writeStoryboard.js';
import { buildPanelPrompts } from './buildPanelPrompts.js';
import { generateImages } from './generateImages.js';
import { addBubbles } from './addBubbles.js';

function outDir(id) {
  const d = path.join(paths.outputs, id);
  mkdirSync(path.join(d, 'panels'), { recursive: true });
  return d;
}

// toon new <id>
export function scaffoldEpisode(id) {
  const file = path.join(paths.scripts, `${id}.md`);
  if (existsSync(file)) die(`이미 존재합니다: ${file}`);
  const tpl = readFileSync(path.join(paths.scripts, 'ep1.md'), 'utf8')
    .replace(/^id:.*$/m, `id: ${id}`);
  writeFileSync(file, tpl, 'utf8');
  ok(`생성됨: scripts/${id}.md — 비트를 채운 뒤 'toon generate ${id}' 실행`);
}

// toon script <id>  →  outputs/<id>/storyboard.json  (무료 API)
export async function runScript(id) {
  const dir = outDir(id);
  step(`[1/2] 대본 파싱: scripts/${id}.md`);
  const episode = parseScript(id);
  ok(`제목: ${episode.meta.title} · 목표 컷: ${episode.meta.panels ?? '자동'}`);

  step('[2/2] 상세 콘티 자동 생성');
  const storyboard = await writeStoryboard(episode);
  writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(storyboard, null, 2), 'utf8');
  ok(`콘티 저장: outputs/${id}/storyboard.json (${storyboard.panels.length}컷)`);
  return storyboard;
}

// toon images <id>  →  outputs/<id>/panels/panel-NN.png (최종본, 과금)
export async function runImages(id) {
  const dir = outDir(id);
  const sbPath = path.join(dir, 'storyboard.json');
  if (!existsSync(sbPath)) die(`콘티가 없습니다. 먼저 'toon script ${id}' 실행`);
  const storyboard = JSON.parse(readFileSync(sbPath, 'utf8'));

  step('[1/2] 컷별 이미지 프롬프트 조립');
  const prompts = buildPanelPrompts(storyboard);

  step('[2/2] 이미지 생성 (캐릭터 시트 레퍼런스 첨부, 세로 4:5, 글자 없음)');
  const images = await generateImages(prompts, dir);
  ok(`${images.length}컷 생성 완료 → outputs/${id}/panels/ (원본, 글자 없음)`);
  return { storyboard, images };
}

// toon bubbles <id>  →  outputs/<id>/final/NN.png  (원본 그림 위 말풍선 합성, 무과금)
export async function runBubbles(id) {
  const dir = outDir(id);
  const sbPath = path.join(dir, 'storyboard.json');
  if (!existsSync(sbPath)) die(`콘티가 없습니다. 먼저 'toon script ${id}' 실행`);
  const storyboard = JSON.parse(readFileSync(sbPath, 'utf8'));
  step('말풍선/효과음 합성 (코드)');
  const finals = await addBubbles(storyboard, dir);
  ok(`${finals.length}컷 → outputs/${id}/final/`);
  return finals;
}

// toon generate <id>  →  대본 → 콘티 → 이미지 → 말풍선 합성 (최종)
export async function runGenerate(id) {
  await runScript(id);
  const { storyboard } = await runImages(id);
  const dir = outDir(id);
  step('말풍선/효과음 합성 (코드)');
  await addBubbles(storyboard, dir);
  ok(`완성: outputs/${id}/final/ 의 NN.png 를 인스타에 순서대로 업로드하세요.`);
  warn('업로드는 수동으로 진행하세요. (말풍선만 다시 만들려면: toon bubbles ' + id + ')');
}
