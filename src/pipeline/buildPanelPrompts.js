// 콘티 → 컷별 이미지 프롬프트 문자열 배열
import { loadBible } from '../config.js';

const STYLE_LOCK =
  'Use the ATTACHED character sheet as the absolute reference for identity and art style. ' +
  'Keep the SAME faces, eye size, front-hair line, and 2.5-head chibi proportions for every character. ' +
  'Hand-drawn rough pencil line, mostly black-and-white, minimal background, exaggerated expression. ' +
  'Do NOT redesign the characters, do NOT add any text or speech bubbles. Vertical composition.';

function castLine(key, bible, hairPhase) {
  const c = bible.characters[key];
  if (!c) return '';
  const a = c.appearance || {};
  const sig = (a.signature || []).join(', ');
  let hair = a.hair || '';
  if (key === 'mumu') hair = hairPhase === 'late' ? '살짝 짧은 리프컷' : '댄디컷';
  return `${c.displayName}: ${hair}, ${a.eyes || ''}, ${sig}. 컬러 포인트=${c.colorPoint || '없음'}.`;
}

export function buildPanelPrompts(storyboard, opts = {}) {
  const bible = loadBible();
  const hairPhase = opts.hairPhase || 'early';

  return storyboard.panels.map((p) => {
    const cast = (p.characters || []).map((k) => castLine(k, bible, hairPhase)).filter(Boolean);
    const emotions = Object.entries(p.emotion || {})
      .map(([k, v]) => `${bible.characters[k]?.displayName || k}=${v}`)
      .join(', ');
    const text = [
      `[STYLE] ${STYLE_LOCK}`,
      `[CAST] ${cast.join(' / ')}`,
      `[SCENE] ${p.action}`,
      emotions && `[EMOTION] ${emotions}`,
      p.sfx && `[SFX] ${p.sfx}`,
      p.note && `[NOTE] ${p.note}`,
    ]
      .filter(Boolean)
      .join('\n');
    return { panel: p.panel, prompt: text };
  });
}
