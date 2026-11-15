너는 고전열전 저장소의 구현 담당이다. 먼저 CLAUDE.md, docs/spec/product-spec.md, docs/spec/requirements.md 를 읽어라.

## 작업
{{TASK}}

## 진행
1. 작업에 해당하는 요구사항 ID를 찾고, 없으면 product-spec 범위 안인지 판단한다. 범위 밖 정책 결정이 필요하면 CLAUDE.md 규칙 4대로 `.ai/conflict.md` 를 쓰고 멈춘다.
2. 구현하고 테스트(ID 붙인 제목)를 추가한다.
3. `npm run typecheck`, `npm test` 를 돌려 통과시킨다. 시간이 허락하면 `npm run build && npx playwright test --project=chromium` 도 돌린다.
4. 마지막에 `.ai/summary.md` 에 변경 요약, 관련 요구사항 ID, 직접 돌린 명령과 결과를 적는다. commit/push 는 하지 않는다.
