# 워크플로

## 0. 최초 1회 설정

```bash
npm install
cp .env.example .env      # Windows PowerShell:  Copy-Item .env.example .env
# .env 에 GEMINI_API_KEY 만 넣으면 이미지 + 대본까지 전부 동작 (기본 SCRIPT_PROVIDER=gemini)
```

- Gemini 무료 키(이미지+대본 공용): https://aistudio.google.com/apikey
- (선택) 대본을 Claude로 뽑고 싶으면 `SCRIPT_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`(https://console.anthropic.com/)
- (선택) LLM 없이 직접 쓰려면 `SCRIPT_PROVIDER=manual`

## 1. 에피소드 작성

`scripts/<id>.md` 를 만든다. 스켈레톤이 필요하면:

```bash
npm run new -- ep2         # scripts/ep2.md 생성
```

프론트매터 + `## 비트` 만 채우면 된다. 자세한 규칙은 `docs/script-format.md`.

## 2. 생성 명령 실행

```bash
npm run generate -- ep1    # 전체 파이프라인
```

부분 실행:

```bash
npm run script -- ep1      # 콘티(storyboard.json)만 생성
npm run images -- ep1      # 콘티 기반 이미지만 생성
```

> `npm run` 에 인자를 넘길 때는 `--` 뒤에 붙인다. 전역 설치 시 `toon generate ep1` 로도 사용 가능.

## 3. 자동 생성 (파이프라인 내부)

1. **대본 파싱** — `scripts/<id>.md` → episode(meta·logline·beats·notes)
2. **콘티 생성** — 대원칙·말투·컷수 규칙에 맞춰 컷 단위 대본/연출 JSON 생성
3. **프롬프트 조립** — 컷마다 스타일 락 + 캐릭터 시그니처 + 연출로 이미지 프롬프트 구성
4. **이미지 생성** — `characters.png`를 레퍼런스로 첨부해 컷 PNG 생성
5. **말풍선 합성** — 대사를 컷 위에 얹음
6. **세로 합치기** — 1080×1350 인스타 프레임 + 미리보기 스트립

## 4. 산출물 확인

```
outputs/ep1/
├── storyboard.json          # 생성된 콘티
├── panels/panel-01.png …    # 원본 컷
├── panels/panel-01-bubble…  # 말풍선 합성본
├── insta/01.png …           # 업로드용 1080x1350 컷
└── strip.png                # 세로 미리보기
```

## 5. 업로드 (수동)

`outputs/<id>/insta/*.png` 를 인스타그램에 캐러셀로 업로드한다. **업로드는 자동화하지 않는다.**

## 재현성/수정 팁

- 콘티가 마음에 안 들면 `storyboard.json`을 직접 고치고 `npm run images -- <id>` 만 다시 실행.
- 특정 컷만 다시 뽑고 싶으면 해당 `panels/panel-NN.png` 삭제 후 재실행(로드맵: 컷 단위 재생성 플래그).
- 무무 헤어 단계는 대본 프론트매터 `hairPhase: early|late` 로 제어.
