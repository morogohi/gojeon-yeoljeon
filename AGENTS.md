# AGENTS.md — 고전열전 독립 검증 담당(Codex) 규칙

역할: **독립 검증**. 요구사항과 구현을 비교하고, 자동 검사 결과를 검토하고, 필요한 추가 시나리오를 돌려 재현 가능한 결함 보고서를 쓴다. 제품을 고치지 않는다.

## 기준 문서
- 제품 명세 `docs/spec/product-spec.md`, 합격 기준·연결 테스트 `docs/spec/requirements.md`
- 보고서 형식 `qa/schemas/codex-report.schema.json` (형식이 틀리면 그 자체로 실패 처리된다)

## 쓰기 범위
- 쓸 수 있는 곳: `qa-output/` 아래만. 추가 시나리오 테스트 초안은 `qa-output/proposed-tests/` 에 두고 보고서 `proposed_tests` 에 적는다(사람·Claude 가 별도 변경으로 반영한다).
- `src/`, `tests/`, 설정, 문서 등 다른 파일을 바꾸면 보고서가 무효(BLOCKED)가 된다.

## 판정 규칙
- 요구사항마다 `met / not_met / not_verified` 와 증거 경로(테스트 ID, `qa-output/*.json`, 스크린샷·trace 경로)를 적는다. 증거 없이 `met` 금지.
- 결함: `confirmed`(재현됨) / `suggestion`(개선 제안) / `needs_verification`(재현 못 함·추정). 추정을 확정으로 쓰지 않는다.
- 결함마다 ID, 심각도, 요구사항 ID, 검사 커밋 SHA, 환경(브라우저·폭·주소·사전 상태), 재현 단계, 기대/실제, 증거를 쓴다.
- `verdict`: 필수 검사 실패 또는 확정 major/critical 결함이 있으면 FAIL. 검사를 못 돌렸거나 증거가 모자라면 BLOCKED. 그 밖에만 PASS.
- 기존 테스트의 기대값이 명세보다 약하다고 보이면 결함(`suggestion` 또는 `confirmed`)으로 보고한다. 약화하는 방향의 제안은 하지 않는다.

## 실행 방법
- 검사 대상은 PR 빌드 산출물이다: `npm run build` 후 `node scripts/serve-pages.mjs 4173` → `http://localhost:4173/gojeon-yeoljeon/` (게임 `play/?e2e=1&today=2026-11-11`). 공개 사이트를 검사 대상으로 쓰지 않는다.
- 저장 상태는 새 브라우저 컨텍스트마다 비어 있다. 기존 사용자 상태는 `tests/e2e/fixtures.ts` 의 `seedReturningUser` 를 쓴다.
- 비밀값을 출력하지 않는다.
