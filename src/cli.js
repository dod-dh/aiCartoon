#!/usr/bin/env node
// AI Cartoon CLI
//   toon new <id>         새 에피소드 대본 스켈레톤 생성 (scripts/<id>.md)
//   toon script <id>      비트 → 콘티(대본+연출) 자동 생성만 실행
//   toon images <id>      콘티 → 컷 이미지 생성만 실행 (script 산출물 필요)
//   toon generate <id>    전체 파이프라인 (script → images → bubbles → stitch)
import { log, die } from './utils/log.js';
import { runGenerate, runScript, runImages, scaffoldEpisode } from './pipeline/index.js';

const [, , cmd, id, ...rest] = process.argv;

const commands = {
  new: () => scaffoldEpisode(id),
  script: () => runScript(id, rest),
  images: () => runImages(id, rest),
  generate: () => runGenerate(id, rest),
};

async function main() {
  if (!cmd || !commands[cmd]) {
    log(`사용법:
  toon new <id>        새 에피소드 대본 스켈레톤
  toon script <id>     콘티 자동 생성
  toon images <id>     컷 이미지 생성
  toon generate <id>   전체 파이프라인 실행`);
    process.exit(cmd ? 1 : 0);
  }
  if (!id) die(`에피소드 id가 필요합니다. 예) toon ${cmd} ep1`);
  await commands[cmd]();
}

main().catch((e) => die(e.stack || String(e)));
