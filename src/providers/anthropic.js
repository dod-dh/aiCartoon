// Claude로 비트 → 콘티(JSON) 확장. 구조화 출력을 위해 tool을 강제한다.
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config.js';

let _client;
function client() {
  if (!env.anthropicApiKey) throw new Error('ANTHROPIC_API_KEY가 필요합니다(.env). 또는 SCRIPT_PROVIDER=manual.');
  return (_client ??= new Anthropic({ apiKey: env.anthropicApiKey }));
}

export async function expandWithClaude({ episode, bible, systemPrompt, schema }) {
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
    '위 비트를 콘티로 확장해서 storyboard 툴을 호출해줘.',
  ].join('\n');

  const res = await client().messages.create({
    model: env.scriptModel,
    max_tokens: 4096,
    system: systemPrompt,
    tools: [{ name: 'storyboard', description: '완성된 콘티', input_schema: schema }],
    tool_choice: { type: 'tool', name: 'storyboard' },
    messages: [{ role: 'user', content: userMsg }],
  });

  const tool = res.content.find((c) => c.type === 'tool_use');
  if (!tool) throw new Error('콘티 생성 실패: tool_use 응답 없음');
  return tool.input;
}
