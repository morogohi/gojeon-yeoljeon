# CLAUDE.md — 고전열전 구현·수정 담당(Claude) 규칙

역할: **구현과 수정**. 합격 여부는 Vitest·Playwright와 Codex 독립 검증이 정한다. 스스로 "통과"라고 판정하지 않는다.

## 기준 문서
- 제품 명세: `docs/spec/product-spec.md` / 합격 기준·연결 테스트: `docs/spec/requirements.md`
- 자동화 흐름·판정: `docs/ops/ai-qa-loop.md`

## 명령
```
npm ci
npm run typecheck   # tsc
npm test            # vitest (단위·콘텐츠·자동화 판정)
npm run build       # dist(앱) + dist-site(홍보 페이지 + /play/)
npm run e2e         # playwright: dist-site 를 /gojeon-yeoljeon/ 하위 경로로 띄워 검사
```
로컬에 WebKit 이 없으면 E2E 는 chromium 프로젝트만 돈다(CI 는 mobile-webkit @smoke 도 돈다).

## 반드시 지킬 것
1. 테스트를 지우거나, `.skip/.only/fixme` 를 넣거나, 기대값·`expect` 를 줄여서 통과시키지 않는다. 기존 테스트가 명세와 맞지 않는다고 판단되면 고치지 말고 `.ai/conflict.md` 에 근거를 적고 멈춘다.
2. 다음은 수정하지 않는다(사람이 관리): `.github/**`, `qa/**`, `scripts/qa/**`, `playwright*.config.ts`, `vite.config.ts`, `tsconfig.json`, `docs/spec/**`, `CLAUDE.md`, `AGENTS.md`, `tests/e2e/fixtures.ts`, `scripts/serve-pages.mjs`, package.json 의 검사 스크립트. 가드(`scripts/qa/qa.mjs guard`)가 막는다.
3. 새 기능·수정에는 테스트를 추가하고, 테스트 제목 앞에 ID(`U-`/`F-`/`E-`…)를 붙인다. 요구사항 표 연결은 사람에게 제안만 한다.
4. 요구사항끼리 충돌하거나 명세에 없는 정책 결정(문구, 학습 내용, 저장 형식 버전, 외부 전송)이 필요하면 `.ai/conflict.md` 에 `requirement_conflict:` 로 시작하는 한 줄과 근거를 쓰고 변경 없이 멈춘다.
5. 비밀값을 출력·저장하지 않는다. 네트워크로 무언가를 보내는 코드를 추가하지 않는다.
6. git commit/push 는 하지 않는다. 변경은 작업 트리에만 남긴다(워크플로가 가드 후 커밋한다).

## 코드 관례
- 프레임워크 없는 DOM UI(`src/ui/dom.ts` 의 `h()`), 화면은 `src/ui/screens/*`, 상태는 `src/state/*`, 규칙은 `src/engine/*`(순수 함수).
- 화면 요소에는 `data-testid` 를 붙인다. 사용자 문구는 한국어, 학습 대상은 초등 고학년·중학생.
