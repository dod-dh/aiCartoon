# 프롬프트 규칙

`docs/웹툰-대원칙.txt`(원칙 원문)와 `characters/characters.json`(기계 판독)을 프롬프트로 옮기는 규칙.
목표는 **어떤 컷에서도 같은 캐릭터·같은 화풍**이 나오게 하는 것.

## A. 콘티 생성(대본 작가 LLM) 규칙

시스템 프롬프트: `prompts/script-writer.md`

- 말투는 `characters.json`을 절대 기준으로. 지어내지 않는다.
- 컷 수는 `panels`(없으면 4~8)에 맞춘다.
- 톤 50% 현실 + 50% 개그. 마지막 컷은 여운 또는 개그 마무리.
- 배경 설명 최소화, 감정·표정·몸짓 중심.
- 한 컷 대사는 짧게(말풍선 1~2개).
- 표정은 시트 라벨 사용: `기본/웃음/신남/놀람/생각중/슬픔/화남/부끄러움`.
- 출력은 storyboard JSON 스키마로만.

## B. 이미지 생성 규칙

템플릿: `prompts/panel-prompt.md` · 조립 코드: `src/pipeline/buildPanelPrompts.js`

### B-1. 매 컷 고정 삽입 (스타일 락)
> Use the ATTACHED character sheet as the absolute reference for identity and art style.
> Keep the SAME faces, eye size, front-hair line, and 2.5-head chibi proportions for every character.
> Hand-drawn rough pencil line, mostly black-and-white, minimal background, exaggerated expression.
> Do NOT redesign the characters, do NOT add any text or speech bubbles. Vertical composition.

### B-2. 레퍼런스 첨부
- `characters/characters.png`를 **항상** 인라인 이미지로 첨부한다(텍스트로만 묘사하지 않는다).
- 시트에는 정면/45도/측면 + 표정 + 전신 비율이 모두 있어 단일 이미지로 다각도 참조가 된다.

### B-3. 캐릭터 문장(바이블에서 조립)
- 모모: 큰 눈, 시스루 앞머리, 하트 머리핀, 볼 두 줄 홍조, 작은 입. 컬러 포인트=연핑크.
- 무무: (early)댄디컷/(late)리프컷, 큰 후드티, 항상 웃는 눈매, 볼 두 줄 홍조. 컬러 포인트=연블루.
- 구름이: 8살 진도믹스, 유기견 출신.

### B-4. 지켜야 할 하드 룰
- 2.5등신 SD 비율.
- 흑백 위주 + 포인트 컬러 최소(모모=핑크, 무무=블루)만.
- 눈·입·얼굴형은 표정이 바뀌어도 동일 인물로 인식되게.
- 배경 최소화, 효과선·표정으로 감정 강조.
- **이미지에는 글자/말풍선을 넣지 않는다** — 말풍선은 후처리(`addBubbles`)에서 합성.

### B-5. 금지(negative) 힌트
- 리얼리즘/3D/과한 채색/복잡한 배경/캐릭터 리디자인/워터마크/텍스트.

## C. 일관성 체크리스트 (생성 후 육안 확인)
- [ ] 두 인물의 얼굴이 시트와 같은가?
- [ ] 2.5등신 비율 유지?
- [ ] 화풍(선/흑백/포인트 컬러)이 컷마다 통일?
- [ ] 표정이 대사 감정과 맞는가?
- [ ] 이미지 안에 원치 않는 글자가 없는가?
