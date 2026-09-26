import { describe, expect, it } from 'vitest';
import { isActiveFailure } from './meta';

const base = {
  hourly_last_ok: '2026-09-27T10:05:00',
  daily_last_ok: '2026-09-27T05:00:00',
  last_failed: null as null | { job: string; finished_at: string | null; message: string | null },
  lookups_loaded_at: null,
};

describe('isActiveFailure', () => {
  it('실패가 없으면 false', () => {
    expect(isActiveFailure(base)).toBe(false);
  });

  it('실패가 해당 job 의 마지막 성공보다 오래됐으면 false', () => {
    expect(
      isActiveFailure({
        ...base,
        last_failed: { job: 'hourly', finished_at: '2026-09-27T09:00:00', message: 'x' },
      }),
    ).toBe(false);
  });

  it('실패가 해당 job 의 마지막 성공보다 최신이면 true', () => {
    expect(
      isActiveFailure({
        ...base,
        last_failed: { job: 'hourly', finished_at: '2026-09-27T11:00:00', message: 'x' },
      }),
    ).toBe(true);
  });

  it('해당 job 의 마지막 성공이 없으면 true', () => {
    expect(
      isActiveFailure({
        ...base,
        daily_last_ok: null,
        last_failed: { job: 'daily', finished_at: '2026-09-27T05:20:00', message: 'x' },
      }),
    ).toBe(true);
  });

  it('job=hourly 는 hourly_last_ok, 그 외(daily, recompute)는 daily_last_ok 와 비교한다', () => {
    expect(
      isActiveFailure({
        ...base,
        last_failed: { job: 'recompute', finished_at: '2026-09-27T04:00:00', message: 'x' },
      }),
    ).toBe(false);
    expect(
      isActiveFailure({
        ...base,
        last_failed: { job: 'recompute', finished_at: '2026-09-27T06:00:00', message: 'x' },
      }),
    ).toBe(true);
  });
});
