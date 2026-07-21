// 비트 → 콘티(JSON). SCRIPT_PROVIDER 에 따라 Claude로 확장하거나 수동 통과.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { paths, env, loadBible } from '../config.js';
import { warn } from '../utils/log.js';
import { expandWithClaude } from '../providers/anthropic.js';
import { expandWithGemini } from '../providers/gemini-text.js';

const STORYBOARD_SCHEMA = {
  type: 'object',
  required: ['episodeId', 'title', 'panels'],
  properties: {
    episodeId: { type: 'string' },
    title: { type: 'string' },
    panels: {
      type: 'array',
      items: {
        type: 'object',
        required: ['panel', 'characters', 'action', 'emotion', 'dialogue'],
        properties: {
          panel: { type: 'number' },
          characters: { type: 'array', items: { type: 'string' } },
          action: { type: 'string' },
          emotion: { type: 'object' },
          dialogue: {
            type: 'array',
            items: {
              type: 'object',
              required: ['who', 'text'],
              properties: { who: { type: 'string' }, text: { type: 'string' } },
            },
          },
          sfx: { type: 'string' },
          note: { type: 'string' },
        },
      },
    },
  },
};

export async function writeStoryboard(episode) {
  const bible = loadBible();
  const systemPrompt = readFileSync(path.join(paths.prompts, 'script-writer.md'), 'utf8');

  switch (env.scriptProvider) {
    case 'manual':
      // LLM 없이: 비트 하나를 그대로 한 컷으로 매핑(초안). 사용자가 storyboard.json 직접 수정.
      warn('SCRIPT_PROVIDER=manual → 비트를 1:1 컷으로 변환한 초안만 생성합니다.');
      return {
        episodeId: episode.id,
        title: episode.meta.title,
        panels: episode.beats.map((b, i) => ({
          panel: i + 1,
          characters: episode.meta.cast || [],
          action: b,
          emotion: {},
          dialogue: [],
        })),
      };
    case 'anthropic':
      return expandWithClaude({ episode, bible, systemPrompt, schema: STORYBOARD_SCHEMA });
    case 'gemini':
    default:
      return expandWithGemini({ episode, bible, systemPrompt });
  }
}
