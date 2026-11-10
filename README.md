# 고전열전 (古典列傳)

**플레이:** https://morogohi.github.io/gojeon-yeoljeon/

사기·논어 12고사로 한자와 고사성어를 익히는 모바일 웹 게임.

## 실행
```bash
npm install
npm run dev        # 개발 서버
npm run build      # dist/index.html 단일 파일 빌드
```

## 테스트
```bash
npm run typecheck  # TypeScript 검사
npm test           # Vitest: 엔진 단위 + 콘텐츠 무결성 (34건)
npm run e2e        # Playwright: 390×844 모바일 E2E (8건, 빌드 후 실행)
```
E2E는 `?e2e=1&today=YYYY-MM-DD` 쿼리로 시드와 날짜를 고정한다. 브라우저는 `npx playwright install chromium`으로 받거나, 이미 있는 크로미움을 `PW_CHROMIUM` 환경변수로 지정한다.

## 배포
`main`에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 타입 검사 → 단위 테스트 → 빌드 → E2E를 거쳐 `gh-pages` 브랜치로 배포한다.

## 구조
- `src/content` 한자 44자, 고사 12편, 인물 10명 (읽기 전용 데이터)
- `src/engine` 문제 생성·전투·간격 반복·보상·퍼즐 (순수 함수)
- `src/state` 세이브(localStorage, 실패 시 메모리)·스토어·해시 라우터
- `src/ui` 화면 9종과 스타일

## 다음 단계
- 한문학 전문가 검수 (원문·풀이·훈음)
- Capacitor로 iOS·Android 패키징, Codemagic 빌드
- 맹자·장자 시즌, 급수 배정표 매핑
