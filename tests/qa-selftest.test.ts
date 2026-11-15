import { add } from '../src/qa-selftest';

// 자가 점검 전용 임시 실패 테스트 (ai-selftest/* 브랜치에만 존재)
it('S-01 add 는 두 수를 더한다', () => {
  expect(add(1, 2)).toBe(3);
});
