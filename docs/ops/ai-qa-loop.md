# AI 개발·검증 반복 — 운영 안내

> **현재 운영 방식(2026-11-16 결정):** 개발은 대화로 Claude 가 하고, 합격 여부는 필수 검사(Vitest·Playwright)가 정한다.
> Codex 독립 검증은 자동으로 돌리지 않는다. PR 에는 필수 검사만 돈다. 필요할 때만 "AI 개발·검증 반복"을 Run workflow 로 시작하며
> `codex_verify` 를 켜야 Codex 가 돈다(기본 끔 → 필수 검사로만 판정).

기준: 요구사항은 [product-spec](../spec/product-spec.md)와 [requirements](../spec/requirements.md)에만 있다. 이 문서는 흐름·판정·운영만 다룬다.

## 1. 흐름

```
(신뢰된 사람) Actions ▸ "AI 개발·검증 반복" ▸ Run workflow
   │  setup: 작업 브랜치 ai/<실행번호> (또는 지정 브랜치) 준비
   ▼
 회차 n (최대 3, .github/workflows/ai-iteration.yml)
   develop  Claude 구현(1회차)·수정(2회차~, 직전 final.json 결함을 입력)   ← 읽기 권한, push 불가
   commit   가드 → 통과한 변경만 커밋·push                                 ← 쓰기 권한, AI 없음
   checks   typecheck → 단위·콘텐츠 → build → E2E (같은 커밋, PR 빌드 산출물)  ← 비밀값 없음
   verify   Codex 독립 검증 (checks PASS일 때만)                            ← OPENAI 키만, 읽기
   decide   final.json(스키마 검사) → PASS / FAIL / BLOCKED, 커밋 상태 게시
   │  next_action: pr → 종료 / retry → 다음 회차 / stop → 종료
   ▼
 finalize: PR 생성·갱신(PASS면 검토 가능 PR, 아니면 Draft) + gojeon-qa/final 상태. 자동 병합 없음.
   ▼
 사람이 검토·병합 → deploy.yml: 필수 검사 → gh-pages 배포 → 공개 주소 확인(build-sha 일치 후 핵심 기능)
```

- 회차 연결은 한 실행 안의 `needs` 로 한다. GITHUB_TOKEN 으로 만든 push·PR 이 다른 워크플로를 깨우지 않는 GitHub 규칙에 기대지 않는다.
- 사람이 연 PR(같은 저장소)도 deploy.yml 에서 필수 검사 → Codex 검증 → `gojeon-qa/pr` 상태를 받는다. 외부(fork) PR 은 비밀값 없이 필수 검사만 돌고 판정은 BLOCKED(독립 검증 미실행)로 남는다. `pull_request_target` 은 쓰지 않는다.

## 2. 역할과 금지

| 주체 | 하는 일 | 못 하는 일 |
| --- | --- | --- |
| Claude (CLAUDE.md) | 구현·수정, 테스트 추가 | push·commit, 보호 파일 수정, 테스트 약화, 네트워크 도구 |
| Vitest·Playwright | 합격/불합격 결정 | — |
| Codex (AGENTS.md) | 요구사항↔구현 비교, 결과 검토, 추가 시나리오, 결함 보고 | `qa-output/` 밖 수정(하면 보고서 무효), 테스트 약화 제안 |
| 사람 | 정책 충돌 결정, 요구사항 표 수정, 병합·배포 | — |

가드(`scripts/qa/qa.mjs guard`)가 AI 변경에서 막는 것: 테스트 파일 삭제, 테스트 수 감소, `expect` 감소, `.skip/.only/fixme/todo`·`test.fail`·`--pass-with-no-tests`·`|| true` 추가, package.json 검사 스크립트 변경, 보호 경로(`.github/`, `qa/`, `scripts/qa/`, Playwright·Vite·TS 설정, `docs/spec/`, CLAUDE.md, AGENTS.md, 테스트 픽스처) 수정. 위반 변경은 push 되지 않고 결함(G-…)으로 다음 회차에 돌아간다.

## 3. 판정 규칙 (`scripts/qa/lib.mjs`, 테스트 Q-01~Q-25)

- **PASS**: 필수 단계 전부 성공, 단위·E2E 0건 아님·실패 0, 가드 통과, Codex 보고서 형식·커밋 일치, 확정 major/critical 결함 0, `not_met` 0, 모든 요구사항 `met` + 증거.
- **FAIL**: 필수 검사 실패, 가드 위반, 확정 major/critical 결함, `not_met`, 보고서 형식 오류·다른 커밋의 보고서(`invalid_report`, 즉시 중단).
- **BLOCKED**: 인증정보 없음, AI 실행 실패·시간 초과, 단계 미실행·테스트 0건, 요구사항 증거 부족, 요구사항 충돌. AI 호출이 성공했다는 사실만으로는 PASS 가 아니다.
- 반복: FAIL 이면 결함을 다음 회차 Claude 에게. 지문(결함 제목·요구사항, 필수 검사 실패는 메시지까지; 커밋·시간 값 제외)이 이전 회차와 같으면 `repeated_failure`, 최대 회차면 `limit_reached` 로 중단.

중단 이유: `limit_reached` · `repeated_failure` · `guard_violation` · `invalid_report` · `blocked_missing_credentials` · `blocked_tool_error` · `insufficient_evidence` · `requirement_conflict`.

## 4. 결과 형식

`qa/schemas/` (JSON Schema 2020-12, 모두 `additionalProperties: false`)

| 파일 | 만드는 곳 | 스키마 |
| --- | --- | --- |
| qa-output/checks.json | checks.yml | checks.schema.json |
| qa-output/codex.json | codex-verify.yml | codex-report.schema.json (결함은 `$defs/defect`) |
| qa-output/develop.json · guard.json | ai-iteration.yml | develop-result · guard-result |
| qa-output/final.json · final.md | decide | final-report.schema.json |

결함 필드: `id, severity(critical/major/minor/info), classification(confirmed/suggestion/needs_verification), title, requirement_ids, commit, environment{browser, viewport, base_url, state}, preconditions, steps[], expected, actual, evidence[]`.

## 5. 시작하기

1. Actions ▸ **AI 개발·검증 반복** ▸ Run workflow
   - task: 예) `REQ-SRS-01: 복습 화면에 '오늘 남은 카드 수'를 표시`
   - branch: 비우면 `ai/<실행번호>` 새로 생성 / 기존 작업을 이어 가려면 그 브랜치 이름
   - max_iterations: 3(기본, 상한) · dry_run: AI 없이 흐름만 점검
2. 끝나면 실행 요약(Summary)과 PR 본문에 회차별 판정·결함·증거가 있다.
3. PR 을 검토하고 사람이 병합한다. 병합 후 deploy.yml 이 배포하고 공개 주소를 확인한다.

## 6. 실패했을 때 보는 곳과 다시 돌리기

- 실행 목록의 주석(annotation): `QA <판정> (iter n/m)` — 로그 권한 없이도 커밋·중단 이유·결함 수가 보인다.
- 커밋 상태: `gojeon-qa/iteration`, `gojeon-qa/final`, `gojeon-qa/pr`.
- 아티팩트: `ai-<n>-checks`(checks.json, unit.json, e2e.json, logs/, playwright-report/, test-results/의 스크린샷·trace), `ai-<n>-codex`, `ai-<n>-final`, `ai-loop-report`.
- 로컬 재현: 결함의 `steps` 그대로. trace 는 `npx playwright show-trace test-results/<…>/trace.zip`.
- 다시 돌리기:
  - 인증·일시 오류(BLOCKED): 원인 해결 뒤 같은 브랜치 이름으로 Run workflow (기존 브랜치에서 이어 감).
  - `repeated_failure`·`limit_reached`: 결함을 보고 사람이 직접 고치거나, task 를 더 구체적으로 바꿔 같은 브랜치로 다시 실행.
  - `requirement_conflict`: requirements.md / product-spec.md 를 사람이 정리한 뒤 다시 실행.
  - 필수 검사만 다시: Actions 의 해당 실행 ▸ Re-run failed jobs.

## 7. 인증정보·권한 (사용자가 직접)

| 항목 | 위치 | 필수 | 설명 |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | Settings ▸ Secrets and variables ▸ Actions ▸ Secrets | 둘 중 하나 | Anthropic Console API 키. 사용량만큼 API 요금 |
| `CLAUDE_CODE_OAUTH_TOKEN` | 〃 | 〃 | 로컬에서 `claude setup-token` 으로 발급. Pro/Max 구독 사용량에서 차감 |
| `OPENAI_API_KEY` | 〃 | Codex 검증에 필수 | OpenAI Platform API 키(사용량 과금). codex-action 은 API 키로 인증 |
| Workflow permissions | Settings ▸ Actions ▸ General | 필수 | "Allow GitHub Actions to create and approve pull requests" 체크(finalize 가 PR 생성) |
| 변수(선택) | Secrets and variables ▸ Variables | 선택 | `CLAUDE_MODEL`, `CLAUDE_MAX_TURNS`(기본 40), `CODEX_MODEL`, `CODEX_EFFORT`(기본 medium) |
| 브랜치 보호(권장) | Settings ▸ Branches ▸ main | 권장 | 필수 상태 `필수 검사 / typecheck → …` 와 `gojeon-qa/pr` |

- 키는 Secrets 에만 둔다. 워크플로는 키를 출력하지 않고, 있는지 여부만 본다. 개발 작업에는 Anthropic 키만, 검증 작업에는 OpenAI 키만, 검사·커밋·판정 작업에는 아무 키도 넘기지 않는다.
- Codex 는 `safety-strategy: drop-sudo`, 샌드박스 `workspace-write`(로컬 서버 검사를 위해 네트워크 허용)로 돈다.
- 비용 상한: 실행당 AI 호출 최대 6회(회차 3 × Claude 1 + Codex 1). Claude 는 `--max-turns`·35분, Codex 는 25분 시간 제한. 추가로 Anthropic Console·OpenAI 프로젝트에 월 예산 한도를 걸어 둔다.
- 새 실행이 같은 브랜치로 시작되면 이전 실행은 취소된다(concurrency).

## 8. 자가 점검(AI 미사용)

`ai-selftest/<시나리오>` 브랜치를 push 하면 스텁 개발자·스텁 검증기로 흐름만 점검한다(판정에 `dry-run` 표시, PR 만들지 않음).

| 시나리오 | 기대 |
| --- | --- |
| pass | 1회차 PASS |
| fix-once | 임시 실패 테스트 → 1회차 FAIL → 결함이 2회차 수정 단계로 전달 → 2회차 PASS |
| never-fix | 매 회차 다른 실패 → 3회차 `limit_reached` |
| repeat | 같은 실패 반복 → 2회차 `repeated_failure` |
| weaken | `.skip` 추가 시도 → 가드 FAIL(push 안 됨) → 2회차 PASS |
| nocreds | 실제 모드 + 인증정보 없음 → 1회차 BLOCKED `blocked_missing_credentials` |
| nocreds-codex | 검사 PASS + Codex 인증정보 없음 → BLOCKED |

임시 실패 코드(`src/qa-selftest.ts`, `tests/qa-selftest.test.ts`)는 자가 점검 브랜치에만 두고 점검 후 브랜치를 지운다.

## 9. 브라우저·환경 범위

- chromium: 전체 E2E(게임·기능·홍보·화면 폭 360/390/768/1440·회복력).
- mobile-webkit(iPhone 13): `@smoke` 태그만(E-01, E-07, R-01). CI 에서만 돈다.
- 돌리지 않는 환경: Firefox, 실제 iOS/Android 기기·WebView(앱 빌드는 deploy.yml·Codemagic 에서 빌드만 확인), 저속 네트워크. checks.json 의 `browsers_not_run` 에 남는다.
