// lib.mjs 의 타입 선언(테스트에서 쓰는 범위)
/* eslint-disable @typescript-eslint/no-explicit-any */
export const MAX_ITERATIONS_CAP: number;
export const PROTECTED: RegExp[];
export function validate(schema: string, data: unknown): { ok: boolean; errors: string[] };
export function readVitest(json: any): any;
export function readPlaywright(json: any): any;
export function summarizeChecks(input: any): any;
export function guard(input: { base: string; changes: { status: string; path: string }[]; baseFiles: Record<string, string>; headFiles: Record<string, string> }): { ok: boolean; base: string; violations: { rule: string; file: string; detail: string }[] };
export function fingerprint(defects: any[]): string;
export function defectsFromChecks(checks: any, commit: string): any[];
export function decide(input: any): any;
export function renderMarkdown(final: any, extra?: any): string;
export function parseRequirements(md: string): { id: string; tests: string[] }[];
export function passedTestTitles(vitest: any, playwright: any): string[];
export function stubVerify(input: any): any;
export function blockedReport(commit: string, reason: string): any;
