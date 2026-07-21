// 파이프라인 오케스트레이터
//   대본 파싱 → 콘티 생성 → 프롬프트 조립 → 이미지 생성 → 말풍선 → 세로 합치기
import path from 'node:path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { paths } from '../config.js';
import { step, ok, warn, die } from '../utils/log.js';
import { parseScript } from './parseScript.js';
import { writeStoryboard } from './writeStoryboard.js';
import { buildPanelPrompts } from './buildPanelPrompts.js';
import { generateImages } from './generateImages.js';
import { addBubbles } from './addBubbles.js';
import { stitch } from './stitch.js';

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

// toon script <id>  →  outputs/<id>/storyboard.json
export async function runScript(id) {
  const dir = outDir(id);
  step(`[1/2] 대본 파싱: scripts/${id}.md`);
  const episode = parseScript(id);
  ok(`제목: ${episode.meta.title} · 목표 컷: ${episode.meta.panels ?? '자동'}`);

  step('[2/2] 콘티(대본+연출) 자동 생성');
  const storyboard = await writeStoryboard(episode);
  writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(storyboard, null, 2), 'utf8');
  ok(`콘티 저장: outputs/${id}/storyboard.json (${storyboard.panels.length}컷)`);
  return storyboard;
}

// toon images <id>  →  outputs/<id>/panels/*.png
export async function runImages(id) {
  const dir = outDir(id);
  const sbPath = path.join(dir, 'storyboard.json');
  if (!existsSync(sbPath)) die(`콘티가 없습니다. 먼저 'toon script ${id}' 실행`);
  const storyboard = JSON.parse(readFileSync(sbPath, 'utf8'));

  step('[1/2] 컷별 이미지 프롬프트 조립');
  const prompts = buildPanelPrompts(storyboard);

  step('[2/2] 이미지 생성 (캐릭터 시트 레퍼런스 첨부)');
  const images = await generateImages(prompts, dir);
  ok(`${images.length}컷 생성 완료`);
  return { storyboard, images };
}

// toon generate <id>  →  전체
export async function runGenerate(id) {
  await runScript(id);
  const { storyboard } = await runImages(id);
  const dir = outDir(id);

  step('말풍선 합성');
  const withBubbles = await addBubbles(storyboard, dir);

  step('세로 웹툰으로 합치기');
  const final = await stitch(withBubbles, dir);
  ok(`완성: ${final}`);
  warn('업로드는 수동으로 진행하세요.');
}
