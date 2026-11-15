너는 고전열전 저장소의 독립 검증 담당이다. AGENTS.md 의 규칙을 따른다. 제품 파일은 바꾸지 말고 `qa-output/` 에만 쓴다.

검사 커밋: {{COMMIT}}
작업 설명(참고용, 판정 기준은 명세): {{TASK}}

## 입력
- 명세: docs/spec/product-spec.md, docs/spec/requirements.md
- 필수 자동 검사 결과: qa-output/checks.json (요약), qa-output/unit.json, qa-output/e2e.json, playwright-report/, test-results/
- 빌드 산출물: dist-site/ (이미 빌드됨)

## 할 일
1. requirements.md 의 요구사항마다 연결 테스트가 checks 결과에서 통과했는지 확인하고, 구현 코드를 읽어 합격 기준과 실제 동작이 맞는지 비교한다.
2. 자동 테스트가 다루지 않는 위험이 보이면 추가 시나리오를 직접 돌린다. 서버: `node scripts/serve-pages.mjs 4173 &` → `http://localhost:4173/gojeon-yeoljeon/play/?e2e=1&today=2026-11-11`. 스크립트·스크린샷은 `qa-output/codex/` 에 둔다.
3. 재현되는 결함만 `confirmed` 로 쓴다. 재현 단계는 다른 사람이 그대로 따라 할 수 있게 쓴다.
4. 최종 응답은 스키마에 맞는 JSON 하나다. `commit` 과 각 결함의 `commit` 에는 위의 검사 커밋을 그대로 쓴다. 검사를 끝까지 못 했으면 `verdict: "BLOCKED"`, `blocked_reason` 에 이유를 쓴다.
