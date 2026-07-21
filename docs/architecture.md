# 아키텍처

## 한눈에 보기

```
scripts/<id>.md            ← 사람이 쓴 에피소드(비트)
   │  parseScript
   ▼
episode(meta/logline/beats)
   │  writeStoryboard   ── Claude API (또는 manual)
   ▼
outputs/<id>/storyboard.json   ← 컷 단위 콘티(대사·연출)
   │  buildPanelPrompts
   ▼
컷별 이미지 프롬프트[]
   │  generateImages   ── Gemini 2.5 Flash Image + characters.png(레퍼런스)
   ▼
outputs/<id>/panels/panel-NN.png
   │  addBubbles       ── sharp/SVG 말풍선 합성
   ▼
outputs/<id>/panels/panel-NN-bubble.png
   │  stitch           ── 1080x1350 프레이밍 + 세로 스트립
   ▼
outputs/<id>/insta/NN.png  +  outputs/<id>/strip.png   → (수동 업로드)
```

## 디렉터리 구조

| 경로 | 역할 |
|------|------|
| `characters/characters.png` | **얼굴·화풍의 최종 기준(source of truth)**. 모든 이미지 생성에 레퍼런스로 첨부 |
| `characters/characters.json` | 시트를 기계 판독용으로 정리한 캐릭터 바이블(설정·말투·컬러 포인트) |
| `docs/` | 원칙·워크플로·포맷 문서 (본 폴더) |
| `docs/웹툰-대원칙.txt` | 사용자가 직접 정한 대원칙(설정 원문) |
| `scripts/<id>.md` | 에피소드 대본(사람이 작성하는 입력) |
| `prompts/` | LLM 시스템 프롬프트 · 이미지 프롬프트 템플릿 |
| `src/` | 파이프라인 코드 |
| `outputs/<id>/` | 생성 산출물(콘티·컷·최종본). git 미추적 |

## src 모듈 맵

| 파일 | 책임 |
|------|------|
| `cli.js` | 명령 디스패치 (`new`/`script`/`images`/`generate`) |
| `config.js` | env·경로·`characters.json` 로더, 캔버스 규격 |
| `pipeline/index.js` | 단계 오케스트레이션 |
| `pipeline/parseScript.js` | `scripts/<id>.md` → episode 객체 |
| `pipeline/writeStoryboard.js` | 비트 → 콘티 JSON (LLM 확장/수동) |
| `pipeline/buildPanelPrompts.js` | 콘티 → 컷별 이미지 프롬프트 |
| `pipeline/generateImages.js` | 프롬프트 → PNG (제공자 선택·순차 실행) |
| `pipeline/addBubbles.js` | 컷 위 말풍선 합성 |
| `pipeline/stitch.js` | 인스타 프레이밍 + 세로 스트립 |
| `providers/gemini.js` | Nano Banana 이미지 생성(시트 첨부) |
| `providers/gemini-text.js` | Gemini 텍스트로 콘티 생성(JSON 강제 출력) — **기본** |
| `providers/anthropic.js` | Claude로 콘티 생성(tool 강제 구조화 출력) — 선택 |
| `providers/pollinations.js` | 키 없는 무료 폴백(일관성 미보장) |

## 얼굴 일관성 전략 (핵심)

1. **레퍼런스 첨부**: 매 컷 생성 시 `characters.png`(정면/45도/측면 + 표정 시트)를 인라인 이미지로 함께 전달.
2. **스타일 락 문구**: 프롬프트 앞머리에 "시트를 절대 기준으로, 얼굴·눈 크기·앞머리 라인·2.5등신 비율 유지, 리디자인 금지" 고정 삽입.
3. **바이블 주입**: `characters.json`에서 등장인물의 외형 시그니처·컬러 포인트를 문장으로 조립.
4. **(로드맵)** 이전 컷을 다음 컷의 추가 레퍼런스로 넘겨 에피소드 내 드리프트 최소화.

## 왜 이 스택인가

- **Gemini 2.5 Flash Image (Nano Banana)**: 레퍼런스 기반 캐릭터 일관성이 마퀴 기능이며 Google AI Studio 무료 티어(약 1,500회/일) 제공.
- **Gemini 텍스트(2.5 Flash)**: 대본·콘티도 같은 키로 생성 → **키 하나로 전체 파이프라인**. `SCRIPT_PROVIDER`로 `anthropic`(Claude) 또는 `manual`(직접 작성) 전환 가능.
- **sharp**: 순수 네이티브 이미지 합성(말풍선·프레이밍). Windows 설치 간편.
