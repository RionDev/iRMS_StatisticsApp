import { describe, expect, it } from 'vitest';
import { DEFAULT_VIEW, VIEWS, parseView, toApiView } from './view';

describe('parseView', () => {
  it('정의된 6개 값은 그대로 돌려준다', () => {
    for (const v of ['today', 'day', 'week', 'month', 'total', 'rising']) {
      expect(parseView(v)).toBe(v);
    }
  });
  it('빈 값·잘못된 값은 week', () => {
    expect(parseView(null)).toBe('week');
    expect(parseView(undefined)).toBe('week');
    expect(parseView('')).toBe('week');
    expect(parseView('weekly')).toBe('week');
    expect(DEFAULT_VIEW).toBe('week');
  });
  it('VIEWS 는 화면 순서와 라벨을 갖는다', () => {
    expect(VIEWS.map((v) => v.label)).toEqual(['오늘', '일간', '주간', '월간', '전체', '급상승']);
  });
});

describe('toApiView', () => {
  it('rising 은 week, 나머지는 그대로', () => {
    expect(toApiView('rising')).toBe('week');
    expect(toApiView('today')).toBe('today');
    expect(toApiView('total')).toBe('total');
  });
});
