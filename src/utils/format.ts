import type { DateRange, TrendWindow, View } from '../types/stats';

export function formatCount(n: number | null | undefined): string {
  return n == null ? '—' : n.toLocaleString('ko-KR');
}

/** 0..1 → "71.2%" */
export function formatRatio(r: number | null | undefined): string {
  return r == null ? '—' : `${(r * 100).toFixed(1)}%`;
}

/** 전주 대비 증가율. null(신규 등장) → "신규" */
export function formatGrowth(g: number | null): string {
  if (g == null) return '신규';
  const rounded = Math.round(g);
  return `${rounded >= 0 ? '+' : ''}${rounded.toLocaleString('ko-KR')}%`;
}

/**
 * 기간 문구. 오늘은 매시 집계라 같은 날 마지막 매시 집계(hourlyLastOk)가 있으면
 * "YYYY-MM-DD 00:00 ~ HH:MM" 으로 시간까지, 나머지(일일 집계)는 날짜만 보인다.
 */
export function formatRange(view: View, range: DateRange | null, hourlyLastOk?: string | null): string {
  if (view === 'total') return '전체 기간';
  if (!range) return '';
  if (view === 'today') {
    return isTodayHourly(range, hourlyLastOk) ? `${range.from} 00:00 ~ ${hourlyLastOk.slice(11, 16)}` : `오늘 (${range.from})`;
  }
  if (range.from === range.to) return range.from;
  return `${range.from} ~ ${range.to.slice(5)}`;
}

/** 오늘 범위와 같은 날의 매시 집계 시각이 있는지 */
export function isTodayHourly(range: DateRange, hourlyLastOk?: string | null): hourlyLastOk is string {
  return !!hourlyLastOk && hourlyLastOk.slice(0, 10) === range.from;
}

export function formatWindow(w: TrendWindow | null): string {
  if (!w) return '급상승 집계 전';
  const md = (d: string) => d.slice(5);
  // 이른 기간 → 늦은 기간 순 (전주 → 이번 주). 다른 범위 표기(from ~ to)와 같은 방향이다.
  return `전주 ${md(w.prev.from)}~${md(w.prev.to)} · 이번 주 ${md(w.cur.from)}~${md(w.cur.to)}`;
}

/** "2026-09-27T00:05:12" → "00:05" */
export function formatTime(iso: string | null): string {
  return iso ? iso.slice(11, 16) : '';
}

/** 집계 시각 — 오늘이면 "HH:MM", 아니면(날짜가 다르면) "MM-DD HH:MM" */
export function formatJobTime(iso: string | null, now: Date = new Date()): string {
  if (!iso) return '';
  const time = iso.slice(11, 16);
  const datePart = iso.slice(0, 10);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayPart = `${y}-${m}-${d}`;
  return datePart === todayPart ? time : `${datePart.slice(5)} ${time}`;
}
