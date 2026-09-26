import type { ApiView, View } from '../types/stats';

export const VIEWS: { value: View; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'day', label: '일간' },
  { value: 'week', label: '주간' },
  { value: 'month', label: '월간' },
  { value: 'total', label: '전체' },
  { value: 'rising', label: '급상승' },
];

export const DEFAULT_VIEW: View = 'week';

const VALUES = new Set<string>(VIEWS.map((v) => v.value));

export function parseView(raw: string | null | undefined): View {
  return raw && VALUES.has(raw) ? (raw as View) : DEFAULT_VIEW;
}

/** 급상승이 없는 통계·KPI 는 급상승 보기에서 주간 값을 보여 준다 */
export function toApiView(view: View): ApiView {
  return view === 'rising' ? 'week' : view;
}
