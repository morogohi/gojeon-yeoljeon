// 고전열전 QA 자동화의 판정 로직 (순수 함수). CLI 래퍼는 같은 폴더의 *.mjs.
// 원칙: 도구가 실행됐다는 사실만으로 PASS 를 주지 않는다. 미실행·차단·형식 오류는 PASS 가 아니다.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const SCHEMA_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../qa/schemas');
export const MAX_ITERATIONS_CAP = 3;

let ajv;
function validator() {
  if (ajv) return ajv;
  ajv = new Ajv2020({ allErrors: true, strict: false });
  for (const f of ['codex-report', 'checks', 'final-report', 'develop-result', 'guard-result']) {
    ajv.addSchema(JSON.parse(readFileSync(join(SCHEMA_DIR, `${f}.schema.json`), 'utf8')), f);
  }
  return ajv;
}

/** 스키마 검사. { ok, errors[] } */
export function validate(schema, data) {
  const v = validator().getSchema(schema);
  if (!v) throw new Error(`unknown schema ${schema}`);
  const ok = v(data);
  return { ok: !!ok, errors: ok ? [] : v.errors.map((e) => `${e.instancePath || '/'} ${e.message}`) };
}

// ───────────────────────── 필수 검사 요약 ─────────────────────────

const REQUIRED_STEPS = [
  ['install', 'npm ci'],
  ['typecheck', 'npm run typecheck'],
  ['unit', 'npm test'],
  ['build', 'npm run build'],
  ['e2e', 'npm run e2e'],
];
const OUTCOME = { success: 'passed', failure: 'failed', skipped: 'skipped', cancelled: 'not_run', '': 'not_run' };

/** Vitest JSON 리포터 결과 → 집계·실패 목록 */
export function readVitest(json) {
  if (!json) return { counts: null, failures: [] };
  const failures = [];
  for (const file of json.testResults ?? []) {
    for (const a of file.assertionResults ?? []) {
      if (a.status === 'failed') failures.push({ source: 'unit', title: a.fullName ?? a.title, file: String(file.name ?? '').replace(/^.*?\/tests\//, 'tests/'), message: String((a.failureMessages ?? [])[0] ?? '').split('\n')[0].slice(0, 300) });
    }
  }
  return {
    counts: { total: json.numTotalTests ?? 0, passed: json.numPassedTests ?? 0, failed: json.numFailedTests ?? 0, skipped: (json.numPendingTests ?? 0) + (json.numTodoTests ?? 0), flaky: 0 },
    failures,
  };
}

/** Playwright JSON 리포터 결과 → 집계·실패·실행한 브라우저·폭 */
export function readPlaywright(json) {
  if (!json) return { counts: null, failures: [], projects: [], viewports: [] };
  const failures = [];
  const projects = new Set();
  const viewports = new Set();
  const walk = (suite, file) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        projects.add(t.projectName);
        const m = /(?:^|\s)L-(\d+)\s/.exec(`${suite.title ?? ''} `) || /(\d{3,4})px/.exec(spec.title);
        if (m) viewports.add(Number(m[1]));
        if (t.status === 'unexpected') {
          const last = t.results?.at(-1);
          failures.push({ source: 'e2e', title: `[${t.projectName}] ${spec.title}`, file: spec.file ?? file ?? '', message: String(last?.error?.message ?? '').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0].slice(0, 300) });
        }
      }
    }
    for (const s of suite.suites ?? []) walk(s, suite.file ?? file);
  };
  for (const s of json.suites ?? []) walk(s, s.file);
  const st = json.stats ?? {};
  const total = (st.expected ?? 0) + (st.unexpected ?? 0) + (st.flaky ?? 0) + (st.skipped ?? 0);
  return {
    counts: { total, passed: st.expected ?? 0, failed: st.unexpected ?? 0, skipped: st.skipped ?? 0, flaky: st.flaky ?? 0 },
    failures, projects: [...projects].sort(), viewports: [...viewports].sort((a, b) => a - b),
  };
}

/**
 * 필수 검사 결과 요약. outcomes: GitHub steps.<id>.outcome 값.
 * - 필수 단계가 하나라도 실패 → FAIL
 * - 실패는 없지만 미실행·건너뜀·테스트 0건 → BLOCKED (PASS 아님)
 */
export function summarizeChecks({ commit, runUrl, outcomes, vitest, playwright, expectedBrowsers = ['chromium', 'mobile-webkit'], evidence = [] }) {
  const steps = REQUIRED_STEPS.map(([name, command]) => ({ name, command, status: OUTCOME[outcomes?.[name] ?? ''] ?? 'not_run' }));
  const unit = readVitest(vitest);
  const e2e = readPlaywright(playwright);
  const failures = [
    ...steps.filter((s) => s.status === 'failed').map((s) => ({ source: 'step', title: `${s.name} 실패`, file: '', message: `${s.command} 가 실패했다` })),
    ...unit.failures, ...e2e.failures,
  ];
  let verdict = 'PASS';
  const notes = [];
  if (failures.length || (unit.counts?.failed ?? 0) > 0 || (e2e.counts?.failed ?? 0) > 0) verdict = 'FAIL';
  else if (steps.some((s) => s.status !== 'passed')) { verdict = 'BLOCKED'; notes.push('필수 단계 미실행'); }
  else if (!unit.counts?.total || !e2e.counts?.total) { verdict = 'BLOCKED'; notes.push('테스트 0건'); }
  return {
    schema_version: 1, commit, run_url: runUrl, verdict, steps,
    unit: unit.counts, e2e: e2e.counts,
    browsers_run: e2e.projects,
    browsers_not_run: expectedBrowsers.filter((b) => !e2e.projects.includes(b)).map((name) => ({ name, reason: playwright ? '이번 실행에서 해당 프로젝트를 돌리지 않음' : 'E2E 결과 없음' })),
    viewports: e2e.viewports, failures, evidence,
  };
}

// ───────────────────────── 가드: 테스트 약화·검사 우회 차단 ─────────────────────────

/** AI 가 바꾸면 안 되는 파일(검사 기준·자동화·명세). 사람이 직접 바꾼다. */
export const PROTECTED = [
  /^\.github\//, /^qa\//, /^scripts\/qa\//, /^playwright(\.public)?\.config\.ts$/, /^vite\.config\.ts$/, /^tsconfig\.json$/,
  /^CLAUDE\.md$/, /^AGENTS\.md$/, /^docs\/spec\//, /^scripts\/serve-pages\.mjs$/, /^tests\/e2e\/fixtures\.ts$/,
];
const TEST_FILE = /^tests\/.*\.(test|spec)\.ts$/;
const countTests = (src) => (src.match(/\b(?:test|it)\s*(?:\.\s*(?:serial|describe)\s*)?\(\s*[`'"]/g) ?? []).length;
const countExpects = (src) => (src.match(/\bexpect\s*(?:\.\s*\w+\s*)?\(/g) ?? []).length;
const WEAKEN = /\.(skip|only|fixme|todo)\s*\(|test\.fail\s*\(|--grep-invert|--pass-with-no-tests|\|\|\s*true/;

/**
 * 변경 비교. changes: [{status:'A'|'M'|'D'|'R', path}], base/head: {path: content} (테스트 파일과 package.json)
 * 임시 자가점검 테스트(tests/qa-selftest*)는 브랜치 안에서만 생겼다 사라지므로 규칙에서 뺀다.
 */
export function guard({ base, changes, baseFiles, headFiles }) {
  const v = [];
  for (const c of changes) {
    if (PROTECTED.some((re) => re.test(c.path))) v.push({ rule: 'protected_path', file: c.path, detail: '검사 기준·자동화·명세 파일은 AI 가 바꾸지 않는다' });
    if (c.status === 'D' && TEST_FILE.test(c.path)) v.push({ rule: 'test_deleted', file: c.path, detail: '기존 테스트 파일 삭제' });
  }
  const testPaths = new Set([...Object.keys(baseFiles), ...Object.keys(headFiles)].filter((p) => TEST_FILE.test(p) && !/qa-selftest/.test(p)));
  let baseCount = 0;
  let headCount = 0;
  for (const p of testPaths) {
    const b = baseFiles[p] ?? '';
    const h = headFiles[p] ?? '';
    baseCount += countTests(b);
    headCount += countTests(h);
    if (b && h && countExpects(h) < countExpects(b)) v.push({ rule: 'expect_reduced', file: p, detail: `expect ${countExpects(b)} → ${countExpects(h)}` });
    const added = h.split('\n').filter((l) => !b.split('\n').includes(l));
    // 문자열 리터럴 안의 글자(예: 테스트가 검사 대상으로 쓰는 "it.skip(")는 빼고 본다
    const bad = added.find((l) => WEAKEN.test(l.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""')));
    if (bad) v.push({ rule: 'test_weakened', file: p, detail: bad.trim().slice(0, 160) });
  }
  if (headCount < baseCount) v.push({ rule: 'test_count_reduced', file: 'tests/', detail: `테스트 ${baseCount} → ${headCount}` });
  const bp = JSON.parse(baseFiles['package.json'] ?? '{}').scripts ?? {};
  const hp = JSON.parse(headFiles['package.json'] ?? '{}').scripts ?? {};
  for (const k of ['typecheck', 'test', 'build', 'build:app', 'build:site', 'e2e']) {
    if ((bp[k] ?? '') !== (hp[k] ?? '')) v.push({ rule: 'check_script_changed', file: 'package.json', detail: `scripts.${k}: "${bp[k] ?? ''}" → "${hp[k] ?? ''}"` });
  }
  return { ok: v.length === 0, base, violations: v };
}

// ───────────────────────── 최종 판정 ─────────────────────────

const norm = (s) => String(s ?? '').replace(/[0-9a-f]{7,40}/g, '').replace(/\d+(\.\d+)?\s*(ms|s)\b/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

/** 같은 오류인지 판단하는 지문(커밋·시간 값을 지운 결함 제목 집합) */
export function fingerprint(defects) {
  // 필수 검사 실패(C-)는 실패 메시지까지 비교한다: 같은 테스트라도 다른 값으로 실패하면 '진전'으로 본다.
  const keys = [...new Set(defects.map((d) => `${d.requirement_ids?.join(',') ?? ''}|${norm(d.title)}|${/^C-/.test(d.id ?? '') ? norm(d.actual) : ''}`))].sort();
  return keys.length ? createHash('sha1').update(keys.join('\n')).digest('hex').slice(0, 16) : '';
}

/** 필수 검사 실패 → 결함 형식으로 변환 (수정 단계 입력) */
export function defectsFromChecks(checks, commit) {
  return (checks?.failures ?? []).map((f, i) => ({
    id: `C-${String(i + 1).padStart(3, '0')}`,
    severity: f.source === 'step' ? 'critical' : 'major',
    classification: 'confirmed',
    title: `${f.source}: ${f.title}`,
    requirement_ids: [],
    commit,
    environment: { browser: f.title.match(/^\[([^\]]+)\]/)?.[1] ?? (f.source === 'e2e' ? 'chromium' : 'node'), viewport: '', base_url: 'http://localhost:4173/gojeon-yeoljeon/', state: '테스트별 격리 컨텍스트' },
    preconditions: 'npm ci && npm run build',
    steps: [f.source === 'unit' ? `npx vitest run ${f.file}` : f.source === 'e2e' ? `npx playwright test ${f.file}` : `해당 단계 명령 실행`],
    expected: '테스트 통과',
    actual: f.message || '실패',
    evidence: f.source === 'e2e' ? ['qa-output/e2e.json', 'playwright-report/', 'test-results/'] : f.source === 'unit' ? ['qa-output/unit.json'] : ['qa-output/logs/'],
  }));
}

function defectsFromGuard(g, commit) {
  return (g?.violations ?? []).map((x, i) => ({
    id: `G-${String(i + 1).padStart(3, '0')}`, severity: 'critical', classification: 'confirmed',
    title: `가드 위반 ${x.rule}: ${x.file}`, requirement_ids: ['QA-GUARD'], commit,
    environment: { browser: 'n/a', viewport: 'n/a', base_url: 'n/a', state: 'n/a' }, preconditions: '',
    steps: ['node scripts/qa/guard.mjs'], expected: '테스트·검사 기준을 약화하지 않음', actual: x.detail, evidence: ['qa-output/guard.json'],
  }));
}

/**
 * 한 회차 판정.
 * 반환 next_action: pr(통과, PR 준비) | retry(수정 단계로) | stop(사람 판단 필요)
 */
export function decide({ commit, branch, iteration, maxIterations, develop, guard: g, checks, codex, previousFingerprints = [], dryRun = false }) {
  const max = Math.min(Math.max(1, maxIterations | 0), MAX_ITERATIONS_CAP);
  const notes = [];
  let defects = [];
  let verdict = 'FAIL';
  let stop = null;

  // 1) 형식 검사: 형식이 틀리거나 다른 커밋의 결과면 판정 불가(FAIL)
  const bad = [];
  for (const [name, schema, data, needed] of [['develop', 'develop-result', develop, true], ['guard', 'guard-result', g, true], ['checks', 'checks', checks, false], ['codex', 'codex-report', codex, false]]) {
    if (data == null) { if (needed) bad.push(`${name}: 결과 없음`); continue; }
    const r = validate(schema, data);
    if (!r.ok) bad.push(`${name}: 스키마 위반 ${r.errors.slice(0, 3).join('; ')}`);
  }
  if (checks && checks.commit !== commit) bad.push(`checks: 다른 커밋(${String(checks.commit).slice(0, 7)})의 결과`);
  if (codex && codex.tool !== 'none' && codex.commit !== commit) bad.push(`codex: 다른 커밋(${String(codex.commit).slice(0, 7)})의 결과`);
  if (codex?.defects?.some((d) => d.commit !== commit)) bad.push('codex: 결함의 commit 이 검사 커밋과 다름');

  const checksVerdict = checks ? checks.verdict : 'NOT_RUN';
  const codexVerdict = codex ? codex.verdict : 'NOT_RUN';

  if (bad.length) {
    notes.push(...bad);
    stop = 'invalid_report';
  } else if (develop.status === 'blocked') {
    verdict = 'BLOCKED';
    stop = /^requirement_conflict/.test(develop.reason) ? 'requirement_conflict'
      : /credential|인증|키|token/i.test(develop.reason) ? 'blocked_missing_credentials' : 'blocked_tool_error';
    notes.push(`개발 단계 차단: ${develop.reason}`);
  } else if (develop.status === 'error') {
    verdict = 'BLOCKED';
    stop = 'blocked_tool_error';
    notes.push(`개발 단계 오류: ${develop.reason}`);
  } else if (!g.ok) {
    defects = defectsFromGuard(g, commit);
    stop = null; // 수정 가능: 약화를 되돌리라고 돌려보낸다
  } else if (!checks) {
    verdict = 'BLOCKED';
    stop = 'blocked_tool_error';
    notes.push('필수 검사 결과가 없다');
  } else if (checks.verdict === 'FAIL') {
    defects = defectsFromChecks(checks, commit);
  } else if (checks.verdict === 'BLOCKED') {
    verdict = 'BLOCKED';
    stop = 'blocked_tool_error';
    notes.push('필수 검사가 끝까지 실행되지 않았다');
  } else if (!codex) {
    verdict = 'BLOCKED';
    stop = 'blocked_tool_error';
    notes.push('Codex 검증 결과가 없다');
  } else if (codex.tool === 'stub' && !dryRun) {
    verdict = 'BLOCKED';
    stop = 'blocked_tool_error';
    notes.push('실제 실행에서 스텁 검증기 결과는 인정하지 않는다');
  } else if (codex.verdict === 'BLOCKED') {
    verdict = 'BLOCKED';
    stop = /key|키|credential|인증|secret/i.test(codex.blocked_reason ?? '') ? 'blocked_missing_credentials' : 'blocked_tool_error';
    notes.push(`Codex 검증 차단: ${codex.blocked_reason ?? '이유 없음'}`);
  } else {
    const blocking = codex.defects.filter((d) => d.classification === 'confirmed' && (d.severity === 'critical' || d.severity === 'major'));
    const notMet = codex.requirements.filter((r) => r.status === 'not_met');
    const noEvidence = codex.requirements.filter((r) => r.status === 'met' && r.evidence.length === 0);
    const unverified = codex.requirements.filter((r) => r.status === 'not_verified');
    defects = codex.defects;
    if (codex.verdict === 'PASS' && (blocking.length || notMet.length)) notes.push('Codex 가 PASS 라고 했지만 확정 결함·미충족 요구사항이 있어 FAIL 로 본다');
    if (blocking.length || notMet.length || codex.verdict === 'FAIL') {
      verdict = 'FAIL';
    } else if (codex.requirements.length === 0 || noEvidence.length || unverified.length) {
      verdict = 'BLOCKED';
      stop = 'insufficient_evidence';
      notes.push(`요구사항 증거 부족: ${[...noEvidence, ...unverified].map((r) => r.id).join(', ') || '요구사항 목록 없음'}`);
    } else {
      verdict = 'PASS';
    }
  }

  const fp = verdict === 'FAIL' ? fingerprint(defects.length ? defects : [{ title: notes.join(' '), requirement_ids: [] }]) : '';
  let next = 'stop';
  if (verdict === 'PASS') next = 'pr';
  else if (verdict === 'FAIL' && !stop) {
    if (fp && previousFingerprints.includes(fp)) stop = 'repeated_failure';
    else if (iteration >= max) stop = 'limit_reached';
    else next = 'retry';
  }
  if (!g?.ok && next === 'stop' && !stop) stop = 'guard_violation';

  return {
    schema_version: 1, commit, branch, iteration, max_iterations: max, dry_run: !!dryRun, verdict, stop_reason: stop, next_action: next,
    checks_verdict: checksVerdict, codex_verdict: codexVerdict, develop_status: develop?.status ?? 'error', guard_ok: !!g?.ok,
    defects, fingerprint: fp, previous_fingerprints: previousFingerprints,
    evidence: ['qa-output/final.json', 'qa-output/checks.json', 'qa-output/codex.json', 'qa-output/guard.json', 'qa-output/e2e.json', 'qa-output/unit.json', 'playwright-report/', 'test-results/'],
    notes,
  };
}

// ───────────────────────── 보고서 ─────────────────────────

const STOP_KO = {
  limit_reached: '자동 수정 횟수 한도에 도달', repeated_failure: '같은 오류가 반복됨', guard_violation: '테스트·검사 기준 약화 시도',
  invalid_report: '결과 형식 오류 또는 커밋 불일치', blocked_missing_credentials: 'AI 인증정보 없음', blocked_tool_error: '도구 실행 오류·미실행',
  insufficient_evidence: '요구사항별 증거 부족', requirement_conflict: '요구사항 충돌(사용자 결정 필요)',
};

export function renderMarkdown(f, { task = '', checks = null, codex = null, runUrl = '' } = {}) {
  const icon = { PASS: '✅ PASS', FAIL: '❌ FAIL', BLOCKED: '⛔ BLOCKED' }[f.verdict];
  const L = [];
  L.push(`## 고전열전 QA 판정: ${icon}${f.dry_run ? ' (dry-run: 스텁으로 흐름만 점검, 제품 통과 아님)' : ''}`, '');
  if (task) L.push(`**작업:** ${task}`, '');
  L.push('| 항목 | 값 |', '| --- | --- |');
  L.push(`| 검사한 커밋 | \`${f.commit}\` |`, `| 브랜치 | \`${f.branch}\` |`, `| 회차 | ${f.iteration} / ${f.max_iterations} |`);
  L.push(`| 개발 단계 | ${f.develop_status} |`, `| 가드(테스트 약화 차단) | ${f.guard_ok ? '통과' : '위반'} |`);
  L.push(`| 필수 자동 검사 | ${f.checks_verdict} |`, `| Codex 독립 검증 | ${f.codex_verdict} |`);
  L.push(`| 다음 단계 | ${{ pr: 'PR 검토(자동 병합 안 함)', retry: 'Claude 수정 단계로 전달', stop: '중단 — 사람 확인 필요' }[f.next_action]} |`);
  if (f.stop_reason) L.push(`| 중단 이유 | ${STOP_KO[f.stop_reason] ?? f.stop_reason} |`);
  if (runUrl) L.push(`| 실행 기록 | ${runUrl} |`);
  L.push('');
  if (checks) {
    L.push('### 필수 검사', '', '| 단계 | 명령 | 결과 |', '| --- | --- | --- |');
    for (const s of checks.steps) L.push(`| ${s.name} | \`${s.command}\` | ${s.status} |`);
    L.push('');
    if (checks.unit) L.push(`- 단위·콘텐츠: ${checks.unit.passed}/${checks.unit.total} 통과, 실패 ${checks.unit.failed}`);
    if (checks.e2e) L.push(`- E2E: ${checks.e2e.passed}/${checks.e2e.total} 통과, 실패 ${checks.e2e.failed}, 재시도 후 통과 ${checks.e2e.flaky}`);
    L.push(`- 실행한 브라우저: ${checks.browsers_run.join(', ') || '없음'}${checks.browsers_not_run.length ? ` · 미실행: ${checks.browsers_not_run.map((b) => `${b.name}(${b.reason})`).join(', ')}` : ''}`);
    L.push(`- 검사한 폭: ${checks.viewports.join(', ') || '없음'}px`, '');
  }
  if (codex?.requirements?.length) {
    L.push('### 요구사항별 증거 (Codex)', '', '| 요구사항 | 상태 | 증거 |', '| --- | --- | --- |');
    for (const r of codex.requirements) L.push(`| ${r.id} | ${r.status} | ${r.evidence.join('<br>') || '—'} |`);
    L.push('');
  }
  if (f.defects.length) {
    L.push('### 결함', '');
    for (const d of f.defects) {
      L.push(`- **${d.id}** [${d.severity} · ${{ confirmed: '확정 결함', suggestion: '개선 제안', needs_verification: '추가 검증 필요' }[d.classification]}] ${d.title}`);
      L.push(`  - 요구사항: ${d.requirement_ids.join(', ') || '—'} · 커밋 \`${d.commit.slice(0, 12)}\` · 환경 ${d.environment.browser} ${d.environment.viewport}`.trimEnd());
      if (d.steps.length) L.push(`  - 재현: ${d.steps.join(' → ')}`);
      L.push(`  - 기대: ${d.expected} / 실제: ${d.actual}`, `  - 증거: ${d.evidence.join(', ')}`);
    }
    L.push('');
  }
  if (f.notes.length) L.push('### 참고', '', ...f.notes.map((n) => `- ${n}`), '');
  return L.join('\n');
}

// ───────────────────────── 요구사항 ↔ 테스트 매핑 ─────────────────────────

/** docs/spec/requirements.md 표에서 `| REQ-ID | ... | 테스트 ID들 |` 행을 읽는다(마지막 열 = 테스트). */
export function parseRequirements(md) {
  const out = [];
  for (const line of md.split('\n')) {
    const m = /^\|\s*((?:REQ|NFR)-[A-Z0-9-]+)\s*\|/.exec(line);
    if (!m) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    const tests = (cells.at(-1) ?? '').match(/\b[A-Z]{1,2}-\d{2,4}\b/g) ?? [];
    out.push({ id: m[1], tests: [...new Set(tests)] });
  }
  return out;
}

/** 통과한 테스트 제목 목록(단위+E2E). 테스트 ID(E-01, L-01, U-03 …)를 뽑는 데 쓴다. */
export function passedTestTitles(vitest, playwright) {
  const titles = [];
  for (const f of vitest?.testResults ?? []) for (const a of f.assertionResults ?? []) if (a.status === 'passed') titles.push(a.fullName ?? a.title);
  const walk = (s) => {
    for (const sp of s.specs ?? []) if ((sp.tests ?? []).length && sp.tests.every((t) => t.status === 'expected' || t.status === 'flaky')) titles.push(`${s.title ?? ''} ${sp.title}`);
    for (const c of s.suites ?? []) walk(c);
  };
  for (const s of playwright?.suites ?? []) walk(s);
  return titles;
}

/**
 * 자가 점검(dry-run)용 결정적 검증기. AI 를 부르지 않고, 요구사항별로 연결된 테스트가 모두 통과했는지만 본다.
 * 연결된 테스트가 없거나 하나라도 통과 기록이 없으면 not_verified.
 */
export function stubVerify({ commit, checks, requirements, vitest, playwright }) {
  const titles = passedTestTitles(vitest, playwright);
  const has = (id) => titles.some((t) => new RegExp(`(^|[\\s\\[(])${id}(\\s|$)`).test(t));
  const reqs = requirements.map((r) => {
    const ok = r.tests.filter(has);
    const status = r.tests.length && ok.length === r.tests.length ? 'met' : checks?.verdict === 'FAIL' && r.tests.length ? 'not_met' : 'not_verified';
    return { id: r.id, status, evidence: ok.map((id) => `qa-output/e2e.json|unit.json: ${id}`), note: status === 'met' ? '' : `연결 테스트 ${r.tests.join(', ') || '없음'} 중 통과 ${ok.join(', ') || '없음'}` };
  });
  const verdict = checks?.verdict === 'PASS' ? (reqs.every((r) => r.status === 'met') ? 'PASS' : 'BLOCKED') : checks?.verdict === 'FAIL' ? 'FAIL' : 'BLOCKED';
  return {
    schema_version: 1, tool: 'stub', commit, verdict,
    summary: '자가 점검용 결정적 검증기(AI 미사용): 요구사항↔테스트 연결과 통과 여부만 확인',
    requirements: reqs, defects: [], proposed_tests: [],
    blocked_reason: verdict === 'BLOCKED' ? '증거가 연결되지 않은 요구사항이 있음' : null,
  };
}

/** 검증 도구를 못 돌렸을 때의 BLOCKED 보고서 */
export function blockedReport(commit, reason) {
  return { schema_version: 1, tool: 'none', commit, verdict: 'BLOCKED', summary: `검증을 실행하지 못했다: ${reason}`, requirements: [], defects: [], proposed_tests: [], blocked_reason: reason };
}
