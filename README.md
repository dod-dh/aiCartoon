# aiCartoon — 인스타 웹툰 자동 생성기

무료 AI 이미지 생성 API(**Gemini 2.5 Flash Image / Nano Banana**)로 인스타그램 세로 웹툰(4~8컷)을
자동 생성한다. `characters/characters.png` 캐릭터 시트를 매 컷 레퍼런스로 첨부해 **주인공 얼굴·화풍을 일관되게** 유지한다.

## 빠른 시작

```bash
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
#  .env 에 GEMINI_API_KEY 만 넣으면 됨 (무료: https://aistudio.google.com/apikey)
#  → 이미지 + 대본·콘티까지 Gemini 하나로 처리 (기본값)

npm run generate -- ep1     # scripts/ep1.md → outputs/ep1/
```

## 흐름

```
scripts/ep1.md (사람이 비트 작성)
  → 콘티 자동생성(대사·연출)  → 이미지 생성(시트 레퍼런스)
  → 말풍선 합성  → 세로 프레이밍  → outputs/ep1/insta/*.png
  → 인스타 업로드(수동)
```

## 명령어

| 명령 | 설명 |
|------|------|
| `npm run new -- <id>` | 새 에피소드 대본 스켈레톤 |
| `npm run script -- <id>` | 콘티(storyboard.json)만 생성 |
| `npm run images -- <id>` | 콘티 기반 컷 이미지만 생성 |
| `npm run generate -- <id>` | 전체 파이프라인 |

## 문서

- `docs/architecture.md` — 구조·모듈 맵·얼굴 일관성 전략
- `docs/workflow.md` — 설정부터 업로드까지 단계별
- `docs/script-format.md` — 대본 작성 규칙
- `docs/prompt-rules.md` — 콘티/이미지 프롬프트 규칙
- `docs/roadmap.md` — 개발 로드맵
- `docs/웹툰-대원칙.txt` — 캐릭터·세계관 대원칙(원문)

## 캐릭터

`characters/characters.png`(시트, 최종 기준) + `characters/characters.json`(설정·말투 바이블).
모모(여주, ♡연핑크) · 무무(남주, ★연블루) · 구름이(진도믹스 반려견).
