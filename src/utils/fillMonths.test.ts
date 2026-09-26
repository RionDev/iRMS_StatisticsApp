import { describe, expect, it } from 'vitest';
import { fillMonths } from './fillMonths';

const row = (date: string, count: number) => ({ date, count, black: count, gray: 0 });

describe('fillMonths', () => {
  it('빈 입력은 빈 배열', () => {
    expect(fillMonths([])).toEqual([]);
  });
  it('사이의 빈 달을 0 으로 채우고 연도 경계를 넘는다', () => {
    const out = fillMonths([row('2026-02', 5), row('2025-11', 3)]);
    expect(out.map((r) => r.date)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
    expect(out.map((r) => r.count)).toEqual([3, 0, 0, 5]);
    expect(out[1]).toEqual({ date: '2025-12', count: 0, black: 0, gray: 0 });
  });
  it('한 달뿐이면 그 달만', () => {
    expect(fillMonths([row('2026-09', 1)])).toEqual([row('2026-09', 1)]);
  });
});
