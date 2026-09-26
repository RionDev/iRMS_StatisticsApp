import { describe, expect, it } from 'vitest';
import { formatCount, formatGrowth, formatRange, formatRatio, formatTime, formatWindow } from './format';

describe('format', () => {
  it('formatCount', () => {
    expect(formatCount(1234567)).toBe('1,234,567');
    expect(formatCount(null)).toBe('—');
  });
  it('formatRatio 는 0..1 을 % 한 자리로', () => {
    expect(formatRatio(0.7123)).toBe('71.2%');
    expect(formatRatio(null)).toBe('—');
  });
  it('formatGrowth', () => {
    expect(formatGrowth(200)).toBe('+200%');
    expect(formatGrowth(-12.4)).toBe('-12%');
    expect(formatGrowth(null)).toBe('신규');
  });
  it('formatRange', () => {
    expect(formatRange('total', null)).toBe('전체 기간');
    expect(formatRange('today', { from: '2026-09-27', to: '2026-09-27' })).toBe('오늘 (2026-09-27)');
    expect(formatRange('day', { from: '2026-09-26', to: '2026-09-26' })).toBe('2026-09-26');
    expect(formatRange('week', { from: '2026-09-20', to: '2026-09-26' })).toBe('2026-09-20 ~ 09-26');
    expect(formatRange('rising', { from: '2026-09-20', to: '2026-09-26' })).toBe('2026-09-20 ~ 09-26');
    expect(formatRange('week', null)).toBe('');
  });
  it('formatWindow', () => {
    expect(formatWindow(null)).toBe('급상승 집계 전');
    expect(
      formatWindow({
        cur: { from: '2026-09-20', to: '2026-09-26' },
        prev: { from: '2026-09-13', to: '2026-09-19' },
      }),
    ).toBe('이번 주 09-20~09-26 · 전주 09-13~09-19');
  });
  it('formatTime 은 ISO 에서 HH:MM', () => {
    expect(formatTime('2026-09-27T00:05:12')).toBe('00:05');
    expect(formatTime(null)).toBe('');
  });
});
