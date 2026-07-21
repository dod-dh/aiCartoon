// scripts/<id>.md 파싱 → { meta, logline, beats, notes }
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';
import { paths } from '../config.js';
import { die } from '../utils/log.js';

export function parseScript(id) {
  const file = path.join(paths.scripts, `${id}.md`);
  if (!existsSync(file)) die(`대본이 없습니다: scripts/${id}.md`);
  const { data: meta, content } = matter(readFileSync(file, 'utf8'));

  const section = (title) => {
    const re = new RegExp(`##\\s*${title}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`);
    return (content.match(re)?.[1] || '').trim();
  };
  const bullets = (block) =>
    block
      .split('\n')
      .map((l) => l.replace(/^\s*[-*]\s?/, '').trim())
      .filter((l) => l && !l.startsWith('<!--'));

  return {
    id,
    meta, // id, title, stage, cast, panels, mood, hairPhase
    logline: section('로그라인').replace(/<!--[\s\S]*?-->/g, '').trim(),
    beats: bullets(section('비트')),
    notes: bullets(section('메모')),
  };
}
