# 컷 이미지 프롬프트 템플릿

이미지 모델(Gemini 2.5 Flash Image / Nano Banana)에 보내는 프롬프트를 조립하는 규칙.
`characters/characters.png`(레퍼런스 시트)를 **항상 함께 첨부**하여 얼굴·화풍을 고정한다.

## 프롬프트 구성 순서
1. **스타일 고정 문구** (매 컷 동일)
   > "Use the attached character sheet as the absolute reference for identity and art style.
   > Keep the SAME faces, eye size, front-hair line, 2.5-head chibi proportions.
   > Hand-drawn rough line, mostly black-and-white, minimal background,
   > exaggerated expression. Do not redesign the characters."

2. **등장 캐릭터 지정** (characters.json에서 조립)
   - 예: "모모: 큰 눈, 시스루 앞머리, 하트 머리핀, 볼 홍조, 오버핏 후드."
   - 무무 헤어는 `hairPhase`에 따라 early=댄디컷 / late=리프컷.

3. **컷 연출** (콘티에서)
   - action(동작/구도) + emotion(표정 라벨) + sfx.

4. **컷 규격**
   - 단일 인물 클로즈업/투샷 등, 세로 컷. 말풍선은 여기서 그리지 말 것(후처리에서 합성).
   - 컬러 포인트는 최소로: 모모=연핑크, 무무=연블루.

## 예시 (컷 5, 무무 심쿵)
```
[STYLE] Use the attached character sheet as the absolute reference ...
[CAST] 무무: 댄디컷, 큰 후드티, 항상 웃는 눈매. 볼 두 줄 홍조 강조.
[SCENE] 무무가 커피를 건네받다 눈이 마주쳐 얼굴이 새빨개진다. 표정: 부끄러움.
        효과선으로 두근거림 강조, 배경 최소화. 세로 구도, 흑백+연블루 볼터치.
[NO] 말풍선/텍스트 넣지 말 것.
```
