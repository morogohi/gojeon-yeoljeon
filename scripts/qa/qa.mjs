#!/usr/bin/env node
// 고전열전 QA 자동화 CLI. 워크플로가 호출한다. 판정 규칙은 lib.mjs.
//   node scripts/qa/qa.mjs <명령> [옵션]
// 명령: summarize-checks | guard | stub-dev | stub-verify | blocked | codex-scope | validate | decide
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import * as qa from './lib.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const opt = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) {
    const k = rest[i].slice(2);
    opt[k] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : 'true';
  } else (opt._ ??= []).push(rest[i]);
}
const OUT = opt.out ?? 'qa-output';
mkdirSync(OUT, { recursive: true });

const readJson = (p) => (p && existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);
const writeJson = (p, d) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`); };
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 << 20 });
const setOutput = (k, v) => { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); console.log(`${k}=${v}`); };
const head = () => (opt.commit ?? process.env.COMMIT ?? git('rev-parse', 'HEAD')).trim();
function mustValid(schema, data, label) {
  const r = qa.validate(schema, data);
  if (!r.ok) { console.error(`::error::${label} 스키마 위반: ${r.errors.join('; ')}`); process.exit(2); }
}

switch (cmd) {
  // 필수 검사 결과 요약 → qa-output/checks.json (형식 오류면 실패)
  case 'summarize-checks': {
    const e = process.env;
    const outcomes = { install: e.O_INSTALL, typecheck: e.O_TYPECHECK, unit: e.O_UNIT, build: e.O_BUILD, e2e: e.O_E2E };
    const checks = qa.summarizeChecks({
      commit: head(), runUrl: e.RUN_URL ?? '', outcomes,
      vitest: readJson(`${OUT}/unit.json`), playwright: readJson(`${OUT}/e2e.json`),
      expectedBrowsers: (e.EXPECTED_BROWSERS ?? 'chromium,mobile-webkit').split(',').filter(Boolean),
      evidence: ['qa-output/checks.json', 'qa-output/unit.json', 'qa-output/e2e.json', 'qa-output/logs/', 'playwright-report/', 'test-results/'],
    });
    mustValid('checks', checks, 'checks.json');
    writeJson(`${OUT}/checks.json`, checks);
    setOutput('verdict', checks.verdict);
    break;
  }

  // 테스트 약화·검사 우회 차단. 변경은 index(git add -A 이후) 기준으로 base 와 비교한다.
  case 'guard': {
    const base = git('rev-parse', opt.base).trim();
    const changes = git('diff', '--cached', '--name-status', '--no-renames', base).trim().split('\n').filter(Boolean)
      .map((l) => { const [status, path] = l.split('\t'); return { status: status[0], path }; });
    const want = (p) => /^tests\/.*\.(test|spec)\.ts$/.test(p) || p === 'package.json';
    const baseFiles = {};
    for (const p of git('ls-tree', '-r', '--name-only', base).split('\n').filter(want)) baseFiles[p] = git('show', `${base}:${p}`);
    const headFiles = {};
    for (const p of git('ls-files').split('\n').filter(want)) if (existsSync(p)) headFiles[p] = readFileSync(p, 'utf8');
    let r = qa.guard({ base, changes, baseFiles, headFiles });
    // 사람이 연 PR(--human)은 보호 경로 수정 자체는 허용하고, 테스트 약화만 본다
    if (opt.human === 'true') r = { ...r, violations: r.violations.filter((v) => v.rule !== 'protected_path') }, r.ok = r.violations.length === 0;
    mustValid('guard-result', r, 'guard.json');
    writeJson(`${OUT}/guard.json`, r);
    for (const v of r.violations) console.log(`::warning file=${v.file}::가드 위반 ${v.rule}: ${v.detail}`);
    setOutput('ok', String(r.ok));
    break;
  }

  // 자가 점검용 개발자 스텁(AI 미사용). 시나리오별로 정해진 변경만 만든다.
  case 'stub-dev': {
    const it = Number(opt.iteration ?? 1);
    const scenario = opt.scenario ?? 'pass';
    const fix = (body) => writeFileSync('src/qa-selftest.ts', `// 자가 점검 전용 임시 파일 (ai-selftest/* 브랜치에만 존재)\nexport const add = (a: number, b: number): number => ${body};\n`);
    let status = 'no_change';
    let reason = `stub ${scenario}: 변경 없음`;
    // 수정 회차는 직전 판정(final.json)의 결함을 입력으로 받는다. 결함이 없으면 고칠 근거가 없다.
    const prev = readJson(opt.prev);
    const got = (prev?.defects ?? []).map((d) => d.id);
    if (scenario === 'fix-once' && it >= 2) {
      if (prev?.defects?.some((d) => /add|qa-selftest/.test(`${d.title} ${d.steps.join(' ')}`))) { fix('a + b'); status = 'done'; reason = `stub fix-once: 받은 결함 ${got.join(',')} 를 보고 add 를 고침`; }
      else reason = 'stub fix-once: 직전 회차 결함 보고를 받지 못해 고치지 않음';
    }
    if (scenario === 'never-fix') { fix(`a + b + ${it}`); status = 'done'; reason = `stub never-fix: 받은 결함 ${got.join(',') || '없음'} → 매번 다른 잘못된 수정(${it})`; }
    if (scenario === 'weaken' && it === 1) {
      const p = 'tests/engine.test.ts';
      writeFileSync(p, readFileSync(p, 'utf8').replace(/\bit\(/, 'it.skip('));
      status = 'done'; reason = 'stub weaken: 기존 테스트에 .skip 을 넣어 통과시키려는 시도';
    }
    const d = { status, tool: 'stub', iteration: it, reason };
    mustValid('develop-result', d, 'develop.json');
    writeJson(`${OUT}/develop.json`, d);
    setOutput('status', status);
    break;
  }

  // 자가 점검용 검증기(AI 미사용): 요구사항↔테스트 연결만 확인
  case 'stub-verify': {
    const report = qa.stubVerify({
      commit: head(), checks: readJson(`${OUT}/checks.json`),
      requirements: qa.parseRequirements(readFileSync(opt.requirements ?? 'docs/spec/requirements.md', 'utf8')),
      vitest: readJson(`${OUT}/unit.json`), playwright: readJson(`${OUT}/e2e.json`),
    });
    mustValid('codex-report', report, 'codex.json');
    writeJson(`${OUT}/codex.json`, report);
    setOutput('verdict', report.verdict);
    break;
  }

  // 인증정보 없음·연결 실패 → BLOCKED 보고서
  case 'blocked': {
    const report = qa.blockedReport(head(), opt.reason ?? '이유 미상');
    writeJson(`${OUT}/${opt.file ?? 'codex.json'}`, report);
    console.log(`::warning::검증 BLOCKED: ${report.blocked_reason}`);
    setOutput('verdict', 'BLOCKED');
    break;
  }

  // Codex 가 qa-output/ 밖을 바꿨는지 확인. 바꿨으면 보고서를 무효(BLOCKED)로 대체하고 원본은 codex-raw.json 으로 보존.
  case 'codex-scope': {
    const changed = git('status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean).map((l) => l.slice(3))
      .filter((p) => !/^(qa-output|playwright-report|test-results|dist|dist-site|node_modules)\//.test(p));
    writeJson(`${OUT}/codex-scope.json`, { changed });
    if (changed.length) {
      const raw = readJson(`${OUT}/codex.json`);
      if (raw) writeJson(`${OUT}/codex-raw.json`, raw);
      writeJson(`${OUT}/codex.json`, qa.blockedReport(head(), `Codex 가 허용 범위 밖 파일을 수정함: ${changed.slice(0, 10).join(', ')}`));
      console.log(`::error::Codex 가 제품 파일을 수정했다(보고서 무효): ${changed.join(', ')}`);
      setOutput('ok', 'false');
    } else setOutput('ok', 'true');
    break;
  }

  // 스키마 검사(+선택: 커밋 일치). 실패하면 종료 코드 1.
  case 'validate': {
    const [schema, file] = opt._ ?? [];
    const data = readJson(file);
    const r = data ? qa.validate(schema, data) : { ok: false, errors: ['파일 없음 또는 빈 파일'] };
    if (r.ok && opt.commit && data.commit !== opt.commit) r.ok = false, r.errors.push(`commit 불일치: ${data.commit} ≠ ${opt.commit}`);
    console.log(r.ok ? `${file}: ${schema} 형식 통과` : `::error::${file}: ${r.errors.join('; ')}`);
    process.exit(r.ok ? 0 : 1);
  }

  // 한 회차 최종 판정 → final.json / final.md, 출력 next_action·verdict·fingerprint
  case 'decide': {
    const e = process.env;
    const prev = (e.PREV_FINGERPRINTS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const final = qa.decide({
      commit: head(), branch: e.BRANCH ?? '', iteration: Number(e.ITERATION ?? 1), maxIterations: Number(e.MAX_ITERATIONS ?? 3),
      develop: readJson(`${OUT}/develop.json`), guard: readJson(`${OUT}/guard.json`),
      checks: readJson(`${OUT}/checks.json`), codex: readJson(`${OUT}/codex.json`),
      previousFingerprints: prev, dryRun: e.DRY_RUN === 'true',
    });
    mustValid('final-report', final, 'final.json');
    writeJson(`${OUT}/final.json`, final);
    const md = qa.renderMarkdown(final, { task: e.TASK ?? '', checks: readJson(`${OUT}/checks.json`), codex: readJson(`${OUT}/codex.json`), runUrl: e.RUN_URL ?? '' });
    writeFileSync(`${OUT}/final.md`, md);
    if (e.GITHUB_STEP_SUMMARY) appendFileSync(e.GITHUB_STEP_SUMMARY, `${md}\n`);
    // 공개 주석: 로그 권한 없이도 실행 목록에서 판정을 볼 수 있다
    console.log(`::notice title=QA ${final.verdict} (iter ${final.iteration}/${final.max_iterations})::commit=${final.commit} next=${final.next_action} stop=${final.stop_reason ?? '-'} checks=${final.checks_verdict} codex=${final.codex_verdict} guard=${final.guard_ok} defects=${final.defects.length} fp=${final.fingerprint || '-'}${final.dry_run ? ' dry-run' : ''}`);
    setOutput('verdict', final.verdict);
    setOutput('next_action', final.next_action);
    setOutput('stop_reason', final.stop_reason ?? '');
    setOutput('fingerprints', [...prev, final.fingerprint].filter(Boolean).join(','));
    break;
  }

  // 프롬프트 템플릿 채우기: {{TASK}} {{COMMIT}} {{PREV_ITERATION}} {{FINAL_JSON}}
  case 'prompt': {
    const e = process.env;
    const finalJson = e.FINAL_JSON_PATH && existsSync(e.FINAL_JSON_PATH) ? readFileSync(e.FINAL_JSON_PATH, 'utf8').trim() : '{}';
    const text = readFileSync(opt.template, 'utf8')
      .replaceAll('{{TASK}}', (e.TASK ?? '').trim() || '(작업 설명 없음)')
      .replaceAll('{{COMMIT}}', e.COMMIT ?? '')
      .replaceAll('{{PREV_ITERATION}}', e.PREV_ITERATION ?? '')
      .replaceAll('{{FINAL_JSON}}', finalJson);
    mkdirSync(dirname(opt.out), { recursive: true });
    writeFileSync(opt.out, text);
    break;
  }

  // OpenAI 구조화 출력용 스키마(메타 키워드 제거)
  case 'codex-schema': {
    const s = JSON.parse(readFileSync('qa/schemas/codex-report.schema.json', 'utf8'));
    delete s.$schema; delete s.$id; delete s.title;
    writeJson(opt.out, s);
    break;
  }

  default:
    console.error('사용법: qa.mjs summarize-checks|guard --base REF [--human]|stub-dev --scenario S --iteration N|stub-verify|blocked --reason R|codex-scope|validate SCHEMA FILE [--commit SHA]|decide');
    process.exit(64);
}
