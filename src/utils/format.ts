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

export function formatRange(view: View, range: DateRange | null): string {
  if (view === 'total') return '전체 기간';
  if (!range) return '';
  if (view === 'today') return `오늘 (${range.from})`;
  if (range.from === range.to) return range.from;
  return `${range.from} ~ ${range.to.slice(5)}`;
}

export function formatWindow(w: TrendWindow | null): string {
  if (!w) return '급상승 집계 전';
  const md = (d: string) => d.slice(5);
  return `이번 주 ${md(w.cur.from)}~${md(w.cur.to)} · 전주 ${md(w.prev.from)}~${md(w.prev.to)}`;
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
