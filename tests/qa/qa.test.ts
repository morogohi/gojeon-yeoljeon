// QA 자동화 판정 로직 테스트. "AI 호출 성공 ≠ 제품 통과", "미실행·차단은 PASS 아님"을 고정한다.
import { readFileSync } from 'node:fs';
import * as qa from '../../scripts/qa/lib.mjs';

const SHA = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);
const OK = { install: 'success', typecheck: 'success', unit: 'success', build: 'success', e2e: 'success' };
const vitest = (failed = 0) => ({
  numTotalTests: 10, numPassedTests: 10 - failed, numFailedTests: failed, numPendingTests: 0, numTodoTests: 0,
  testResults: [{ name: '/w/tests/engine.test.ts', assertionResults: [
    { status: 'passed', fullName: 'U-02 8문제' },
    ...(failed ? [{ status: 'failed', fullName: 'add 는 더한다', failureMessages: ['AssertionError: expected -1 to be 5\n at ...'] }] : []),
  ] }],
});
const pw = (unexpected = 0, projects = ['chromium', 'mobile-webkit']) => ({
  stats: { expected: 30, unexpected, flaky: 0, skipped: 0 },
  suites: [{ title: 'layout.spec.ts', file: 'layout.spec.ts', suites: [{ title: 'L-360 360px', specs: [{ title: 'L-01 신규 사용자 화면 360px', file: 'layout.spec.ts', tests: projects.map((p) => ({ projectName: p, status: 'expected', results: [] })) }] }],
    specs: [{ title: 'E-01 첫 고사 @smoke', file: 'game.spec.ts', tests: [{ projectName: 'chromium', status: unexpected ? 'unexpected' : 'expected', results: [{ error: { message: '\u001b[31mExpected: 3\u001b[0m' } }] }] }] }],
});
const checks = (over: Record<string, unknown> = {}) => qa.summarizeChecks({ commit: SHA, runUrl: 'r', outcomes: OK, vitest: vitest(), playwright: pw(), ...over });
const dev = { status: 'done', tool: 'claude', iteration: 1, reason: '' };
const guardOk = { ok: true, base: OTHER, violations: [] };
const env = { browser: 'chromium', viewport: '390x844', base_url: 'http://localhost:4173/gojeon-yeoljeon/', state: '신규' };
const defect = (over: Record<string, unknown> = {}) => ({ id: 'D-001', severity: 'major', classification: 'confirmed', title: '결과 화면 한자 수 불일치', requirement_ids: ['REQ-LEARN-03'], commit: SHA, environment: env, preconditions: '', steps: ['a'], expected: 'x', actual: 'y', evidence: ['qa-output/e2e.json'], ...over });
const codex = (over: Record<string, unknown> = {}) => ({ schema_version: 1, tool: 'codex', commit: SHA, verdict: 'PASS', summary: '', requirements: [{ id: 'REQ-PLAY-01', status: 'met', evidence: ['E-01'], note: '' }], defects: [], proposed_tests: [], blocked_reason: null, ...over });
const base = (over: Record<string, unknown> = {}) => ({ commit: SHA, branch: 'ai/x', iteration: 1, maxIterations: 3, develop: dev, guard: guardOk, checks: checks(), codex: codex(), ...over });

describe('Q 필수 검사 요약', () => {
  it('Q-01 모든 단계 성공 + 테스트 있음 → PASS, 브라우저·폭 기록', () => {
    const c = checks();
    expect(c.verdict).toBe('PASS');
    expect(c.browsers_run).toEqual(['chromium', 'mobile-webkit']);
    expect(c.viewports).toEqual([360]);
    expect(qa.validate('checks', c).ok).toBe(true);
  });
  it('Q-02 단계 실패·테스트 실패 → FAIL, 실패 목록에 파일·메시지(색상 코드 제거)', () => {
    const c = checks({ outcomes: { ...OK, e2e: 'failure' }, playwright: pw(1) });
    expect(c.verdict).toBe('FAIL');
    expect(c.failures.map((f: { source: string }) => f.source)).toEqual(['step', 'e2e']);
    expect(c.failures[1].message).toBe('Expected: 3');
  });
  it('Q-03 단계 미실행(cancelled/없음)·테스트 0건은 PASS 가 아니라 BLOCKED', () => {
    expect(checks({ outcomes: { ...OK, e2e: 'cancelled' } }).verdict).toBe('BLOCKED');
    expect(checks({ outcomes: { ...OK, e2e: undefined } }).verdict).toBe('BLOCKED');
    expect(checks({ playwright: null }).verdict).toBe('BLOCKED');
    expect(checks({ vitest: { ...vitest(), numTotalTests: 0 } }).verdict).toBe('BLOCKED');
  });
  it('Q-04 실행하지 않은 브라우저를 이유와 함께 남긴다', () => {
    const c = checks({ playwright: pw(0, ['chromium']) });
    expect(c.browsers_not_run.map((b: { name: string }) => b.name)).toEqual(['mobile-webkit']);
  });
});

describe('Q 가드(테스트 약화·검사 우회 차단)', () => {
  const t = (n: number, e = n) => Array.from({ length: n }, (_, i) => `it('t${i}', () => { ${'expect(1).toBe(1); '.repeat(i < e ? 1 : 0)}});`).join('\n');
  const pkg = JSON.stringify({ scripts: { test: 'vitest run', e2e: 'playwright test' } });
  const g = (headFiles: Record<string, string>, changes: { status: string; path: string }[] = [], baseFiles: Record<string, string> = { 'tests/a.test.ts': t(3), 'package.json': pkg }) =>
    qa.guard({ base: OTHER, changes, baseFiles, headFiles: { 'package.json': pkg, ...headFiles } });

  it('Q-05 제품 코드 수정·테스트 추가는 통과', () => {
    expect(g({ 'tests/a.test.ts': t(4) }, [{ status: 'M', path: 'src/ui/quiz.ts' }]).ok).toBe(true);
  });
  it('Q-06 테스트 삭제·개수 감소·expect 감소·skip/only 추가를 막는다', () => {
    const rules = (r: ReturnType<typeof g>) => r.violations.map((v) => v.rule).sort();
    expect(rules(g({}, [{ status: 'D', path: 'tests/a.test.ts' }]))).toEqual(['test_count_reduced', 'test_deleted']);
    expect(rules(g({ 'tests/a.test.ts': t(3, 2) }))).toEqual(['expect_reduced']);
    expect(rules(g({ 'tests/a.test.ts': t(3).replace("it('t0'", "it.skip('t0'") }))).toContain('test_weakened');
    expect(rules(g({ 'tests/a.test.ts': `${t(3)}\ntest.only('x', () => {})` }))).toContain('test_weakened');
    // 문자열 안의 ".skip(" 은 약화가 아니다
    expect(g({ 'tests/a.test.ts': `${t(3)}\nconst s = "it.skip('t0'";` }).ok).toBe(true);
  });
  it('Q-07 검사 기준·자동화·명세 파일과 package.json 검사 스크립트 변경을 막는다', () => {
    const r = g({ 'package.json': JSON.stringify({ scripts: { test: 'vitest run --passWithNoTests', e2e: 'playwright test' } }), 'tests/a.test.ts': t(3) },
      ['.github/workflows/checks.yml', 'playwright.config.ts', 'qa/schemas/checks.schema.json', 'scripts/qa/lib.mjs', 'AGENTS.md', 'docs/spec/requirements.md'].map((path) => ({ status: 'M', path })));
    expect(r.violations.filter((v) => v.rule === 'protected_path')).toHaveLength(6);
    expect(r.violations.some((v) => v.rule === 'check_script_changed')).toBe(true);
  });
  it('Q-08 자가 점검 임시 테스트(qa-selftest)는 개수 비교에서 뺀다', () => {
    expect(g({ 'tests/a.test.ts': t(3) }, [{ status: 'D', path: 'tests/qa-selftest.test.ts' }], { 'tests/a.test.ts': t(3), 'tests/qa-selftest.test.ts': t(1), 'package.json': pkg }).violations.map((v) => v.rule)).toEqual(['test_deleted']);
  });
});

describe('Q 최종 판정', () => {
  it('Q-10 검사 통과 + Codex 요구사항 증거 충분 → PASS, PR', () => {
    const f = qa.decide(base());
    expect([f.verdict, f.next_action, f.stop_reason]).toEqual(['PASS', 'pr', null]);
    expect(qa.validate('final-report', f).ok).toBe(true);
  });
  it('Q-11 필수 검사 실패 → FAIL, 결함을 수정 단계로(retry)', () => {
    const f = qa.decide(base({ checks: checks({ vitest: vitest(1) }), codex: null }));
    expect([f.verdict, f.next_action]).toEqual(['FAIL', 'retry']);
    expect(f.defects[0]).toMatchObject({ id: 'C-001', classification: 'confirmed', commit: SHA });
    expect(f.fingerprint).toMatch(/^[0-9a-f]{16}$/);
  });
  it('Q-12 같은 오류가 반복되면 중단(repeated_failure)', () => {
    const first = qa.decide(base({ checks: checks({ vitest: vitest(1) }), codex: null }));
    const again = qa.decide(base({ iteration: 2, checks: checks({ vitest: vitest(1) }), codex: null, previousFingerprints: [first.fingerprint] }));
    expect([again.verdict, again.next_action, again.stop_reason]).toEqual(['FAIL', 'stop', 'repeated_failure']);
  });
  it('Q-13 다른 오류라도 최대 회차에 이르면 중단(limit_reached), 상한은 3', () => {
    const f = qa.decide(base({ iteration: 3, maxIterations: 9, checks: checks({ vitest: vitest(1) }), codex: null, previousFingerprints: ['x'] }));
    expect([f.next_action, f.stop_reason, f.max_iterations]).toEqual(['stop', 'limit_reached', 3]);
  });
  it('Q-14 가드 위반 → FAIL, 약화를 되돌리도록 재시도(마지막 회차면 중단)', () => {
    const g = { ok: false, base: OTHER, violations: [{ rule: 'test_weakened', file: 'tests/engine.test.ts', detail: "it.skip('...')" }] };
    const f = qa.decide(base({ guard: g, checks: null, codex: null }));
    expect([f.verdict, f.next_action, f.guard_ok, f.checks_verdict]).toEqual(['FAIL', 'retry', false, 'NOT_RUN']);
    expect(f.defects[0].requirement_ids).toEqual(['QA-GUARD']);
    expect(qa.decide(base({ iteration: 3, guard: g, checks: null, codex: null })).stop_reason).toBe('limit_reached');
  });
  it('Q-15 인증정보 없음 → BLOCKED (PASS 로 표시하지 않음)', () => {
    const noKey = qa.decide(base({ codex: qa.blockedReport(SHA, 'OPENAI_API_KEY 시크릿이 없음(credential missing)') }));
    expect([noKey.verdict, noKey.stop_reason, noKey.next_action]).toEqual(['BLOCKED', 'blocked_missing_credentials', 'stop']);
    const devNoKey = qa.decide(base({ develop: { status: 'blocked', tool: 'none', iteration: 1, reason: 'ANTHROPIC credential missing' }, checks: null, codex: null }));
    expect([devNoKey.verdict, devNoKey.stop_reason]).toEqual(['BLOCKED', 'blocked_missing_credentials']);
  });
  it('Q-16 Codex 결과 없음·필수 검사 결과 없음·도구 오류 → BLOCKED', () => {
    expect(qa.decide(base({ codex: null })).verdict).toBe('BLOCKED');
    expect(qa.decide(base({ checks: null, codex: null })).verdict).toBe('BLOCKED');
    expect(qa.decide(base({ develop: { ...dev, status: 'error', reason: 'timeout' } })).stop_reason).toBe('blocked_tool_error');
  });
  it('Q-17 형식이 틀린 보고서·다른 커밋의 보고서 → FAIL(invalid_report), 중단', () => {
    const bad = qa.decide(base({ codex: { ...codex(), verdict: 'OK' } }));
    expect([bad.verdict, bad.stop_reason, bad.next_action]).toEqual(['FAIL', 'invalid_report', 'stop']);
    expect(qa.decide(base({ codex: { ...codex(), extra: 1 } })).stop_reason).toBe('invalid_report');
    expect(qa.decide(base({ codex: codex({ commit: OTHER }) })).stop_reason).toBe('invalid_report');
    expect(qa.decide(base({ checks: { ...checks(), commit: OTHER } })).stop_reason).toBe('invalid_report');
    expect(qa.decide(base({ codex: codex({ defects: [defect({ commit: OTHER })] }) })).stop_reason).toBe('invalid_report');
  });
  it('Q-18 Codex 가 PASS 라 해도 확정 major/critical 결함·미충족 요구사항이 있으면 FAIL', () => {
    expect(qa.decide(base({ codex: codex({ defects: [defect()] }) })).verdict).toBe('FAIL');
    expect(qa.decide(base({ codex: codex({ requirements: [{ id: 'REQ-PLAY-01', status: 'not_met', evidence: [], note: '' }] }) })).verdict).toBe('FAIL');
    // 개선 제안·minor 는 통과를 막지 않는다
    expect(qa.decide(base({ codex: codex({ defects: [defect({ classification: 'suggestion' }), defect({ id: 'D-002', severity: 'minor' })] }) })).verdict).toBe('PASS');
  });
  it('Q-19 요구사항 증거가 없거나 미검증이면 BLOCKED(insufficient_evidence)', () => {
    expect(qa.decide(base({ codex: codex({ requirements: [] }) })).stop_reason).toBe('insufficient_evidence');
    expect(qa.decide(base({ codex: codex({ requirements: [{ id: 'REQ-PLAY-01', status: 'met', evidence: [], note: '' }] }) })).stop_reason).toBe('insufficient_evidence');
    expect(qa.decide(base({ codex: codex({ requirements: [{ id: 'REQ-PLAY-01', status: 'not_verified', evidence: [], note: '' }] }) })).verdict).toBe('BLOCKED');
  });
  it('Q-20 스텁 검증기 결과는 dry-run 에서만 인정, 실제 실행에서는 BLOCKED', () => {
    expect(qa.decide(base({ codex: codex({ tool: 'stub' }) })).verdict).toBe('BLOCKED');
    const dry = qa.decide(base({ codex: codex({ tool: 'stub' }), dryRun: true }));
    expect([dry.verdict, dry.dry_run]).toEqual(['PASS', true]);
  });
  it('Q-26 Codex 검증을 켜지 않은 실행은 필수 검사로만 판정한다(검사 실패·미실행은 그대로 FAIL·BLOCKED)', () => {
    const ok = qa.decide(base({ codex: null, checksOnly: true }));
    expect([ok.verdict, ok.next_action, ok.codex_verdict]).toEqual(['PASS', 'pr', 'NOT_RUN']);
    expect(qa.decide(base({ codex: null, checksOnly: true, checks: checks({ vitest: vitest(1) }) })).verdict).toBe('FAIL');
    expect(qa.decide(base({ codex: null, checksOnly: true, checks: checks({ playwright: null }) })).verdict).toBe('BLOCKED');
    // 끄지 않았는데 Codex 결과가 없으면 여전히 BLOCKED
    expect(qa.decide(base({ codex: null })).verdict).toBe('BLOCKED');
  });
  it('Q-21 요구사항 충돌은 사람 결정으로 넘긴다', () => {
    const f = qa.decide(base({ develop: { status: 'blocked', tool: 'claude', iteration: 1, reason: 'requirement_conflict: REQ-A 와 REQ-B 충돌' }, checks: null, codex: null }));
    expect([f.verdict, f.stop_reason]).toEqual(['BLOCKED', 'requirement_conflict']);
  });
  it('Q-22 지문은 커밋 SHA·시간 값에 흔들리지 않는다', () => {
    const a = qa.fingerprint([defect({ title: `타임아웃 1234ms at ${SHA}` })]);
    const b = qa.fingerprint([defect({ title: `타임아웃 98ms at ${OTHER}` })]);
    expect(a).toBe(b);
    expect(qa.fingerprint([])).toBe('');
  });
  it('Q-23 보고서 마크다운에 판정·커밋·결함 재현 정보가 들어간다', () => {
    const f = qa.decide(base({ codex: codex({ verdict: 'FAIL', defects: [defect()] }) }));
    const md = qa.renderMarkdown(f, { checks: checks(), codex: codex({ defects: [defect()] }) });
    for (const s of ['❌ FAIL', SHA, 'D-001', 'REQ-LEARN-03', '확정 결함', 'chromium, mobile-webkit']) expect(md).toContain(s);
  });
});

describe('Q 요구사항 연결', () => {
  it('Q-24 명세의 모든 요구사항에 테스트가 연결되어 있고, 연결된 테스트 ID가 실제 테스트에 있다', () => {
    const reqs = qa.parseRequirements(readFileSync('docs/spec/requirements.md', 'utf8'));
    expect(reqs.length).toBeGreaterThanOrEqual(10);
    const ids = new Set(reqs.map((r) => r.id));
    expect(ids.size).toBe(reqs.length);
    const src = ['tests/content.test.ts', 'tests/engine.test.ts', 'tests/features.test.ts', 'tests/qa/qa.test.ts',
      'tests/e2e/game.spec.ts', 'tests/e2e/features.spec.ts', 'tests/e2e/site.spec.ts', 'tests/e2e/layout.spec.ts', 'tests/e2e/resilience.spec.ts']
      .map((p) => readFileSync(p, 'utf8')).join('\n');
    for (const r of reqs) {
      expect(r.tests.length, r.id).toBeGreaterThan(0);
      for (const t of r.tests) expect(src, `${r.id} → ${t}`).toMatch(new RegExp(`['\`]${t}[\\s'\`]`));
    }
  });
  it('Q-25 스텁 검증기: 연결 테스트가 전부 통과해야 met, 아니면 not_verified/BLOCKED', () => {
    const reqs = [{ id: 'REQ-PLAY-01', tests: ['E-01', 'U-02'] }, { id: 'NFR-LAYOUT', tests: ['L-01'] }];
    const r = qa.stubVerify({ commit: SHA, checks: checks(), requirements: reqs, vitest: vitest(), playwright: pw() });
    expect(r.verdict).toBe('PASS');
    expect(qa.validate('codex-report', r).ok).toBe(true);
    const r2 = qa.stubVerify({ commit: SHA, checks: checks(), requirements: [...reqs, { id: 'REQ-X', tests: ['E-99'] }], vitest: vitest(), playwright: pw() });
    expect(r2.verdict).toBe('BLOCKED');
  });
});
