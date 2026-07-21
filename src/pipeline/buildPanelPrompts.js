// 콘티(상세) → 컷별 이미지 프롬프트.
// 대원칙: 첨부한 캐릭터 시트를 얼굴·표정·신체·화풍의 절대 기준으로 100% 따른다.
// 외형은 텍스트로 장황하게 설명하지 않는다(시트가 유일한 기준). 텍스트는 '무엇을 하는가'만 지시.
import { loadBible } from '../config.js';

// 매 컷 최상단에 강하게 고정하는 시트 준수 지시.
const SHEET_LOCK = [
  '# 절대 규칙 — 화풍/얼굴 (다른 어떤 지시보다 우선)',
  '첨부 이미지는 이 웹툰의 "공식 캐릭터 시트"다(앞=전체 시트, 뒤=등장 캐릭터 확대본).',
  '**반드시 2.5~3등신 SD 치비 낙서풍**으로만 그린다. 머리가 몸통만큼 크고 팔다리는 짧고 뭉툭하다.',
  '아래는 절대 금지: 사실적 인체 비율, 실사풍, 반실사, 성인/청소년 체형, 영화적 명암·그림자 렌더링, 정교한 음영, 등신대 캐릭터.',
  '풀샷·전신 컷이어도 예외 없이 시트의 2.5등신 치비 비율을 그대로 유지한다(전신이라고 사실적으로 그리지 말 것).',
  '얼굴형·눈 모양과 크기·앞머리 라인·머리 모양을 시트와 100% 똑같이 복제한다. 새 얼굴/디자인 창작 금지. 매 컷 동일 인물로 보여야 한다.',
  '선은 손으로 슥슥 그린 연필 느낌, 거의 흑백(포인트 컬러만 아주 약간), 둥글고 단순하게. 배경은 단순한 선화로 최소화.',
  '분위기(어둠/피곤 등)는 사실적 명암이 아니라 **표정·간단한 효과선·작은 소품(땀방울, 눈물 등)** 으로만 표현한다.',
  '시트는 "그림체/얼굴 참고용"일 뿐이다. 시트의 격자 배치·여러 포즈 나열·표정 모음·라벨 글자를 절대 복제하지 마라.',
  '결과물은 지시된 장면 "하나"만 담은 단일 일러스트다. 화면을 여러 칸/격자/모델시트처럼 나누지 마라(단, 명시적으로 "세로 분할"이 지시되면 딱 좌우 2칸만).',
].join('\n');

// 프롬프트 맨 끝에 다시 한 번 못박는다(최신성 효과).
const SHEET_LOCK_TAIL =
  '# 다시 강조: 무조건 시트와 동일한 2.5등신 치비 낙서풍. 사실적/실사/등신대 절대 금지. 얼굴은 시트 그대로.';

const ANTI_HALLUCINATION =
  '아래 지시에 명시된 인물·소품·행동만 그린다. 적혀 있지 않은 물건·인물을 추가하지 마라. 손에 든 것은 지시 그대로(빈손이면 아무것도 들지 않음).';

// 말풍선/대사/효과음은 코드로 후합성한다 → banana는 글자를 그리지 않는다.
const NO_TEXT =
  '이미지 안에 어떤 글자/문자/말풍선/효과음 텍스트도 그리지 마라(대사·효과음은 이후 코드로 합성). ' +
  '말풍선이 들어갈 여백을 위해 인물을 화면 정중앙보다 약간 아래쪽에 배치해 상단에 빈 공간을 남겨라.';

function actionsBlock(p, bible) {
  const acts = p.characterActions || {};
  return (p.characters || [])
    .map((k) => {
      const name = bible.characters[k]?.displayName || k;
      const a = acts[k] || {};
      const emo = a.expression || (p.emotion && p.emotion[k]) || '';
      const parts = [
        a.pose && `자세: ${a.pose}`,
        a.hands && `손: ${a.hands}`,
        a.gaze && `시선: ${a.gaze}`,
        emo && `표정: ${emo}`,
      ].filter(Boolean);
      return `- ${name}(시트 기준 그대로): ${parts.join(' / ') || '(지시 없음)'}`;
    })
    .join('\n');
}

export function buildPanelPrompts(storyboard) {
  const bible = loadBible();

  return storyboard.panels.map((p) => {
    const names = (p.characters || []).map((k) => bible.characters[k]?.displayName || k).join(', ');
    const props = (p.props || []).length ? (p.props || []).join(', ') : '없음';

    const text = [
      SHEET_LOCK,
      '',
      '# 이 컷 지시',
      `[제약] ${ANTI_HALLUCINATION}`,
      `[등장] ${names} (세로 4:5 구도)`,
      p.shot && `[샷] ${p.shot}`,
      p.composition && `[구도] ${p.composition}`,
      p.setting && `[배경] ${p.setting} (최소한으로)`,
      `[동작]\n${actionsBlock(p, bible)}`,
      `[소품] ${props}`,
      p.action && `[장면] ${p.action}`,
      `[텍스트 금지] ${NO_TEXT}`,
      p.note && `[연출] ${p.note}`,
      '',
      SHEET_LOCK_TAIL,
    ]
      .filter(Boolean)
      .join('\n');

    return { panel: p.panel, characters: p.characters || [], prompt: text };
  });
}
