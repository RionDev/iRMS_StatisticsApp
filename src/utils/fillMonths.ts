import type { InflowItem } from '../types/stats';

/** total 보기 월별 유입 — API 는 데이터가 있는 달만 주므로 첫 달~마지막 달 사이를 0 으로 채운다 */
export function fillMonths(items: InflowItem[]): InflowItem[] {
  if (items.length === 0) return [];
  const byMonth = new Map(items.map((it) => [it.date, it]));
  const keys = [...byMonth.keys()].sort();
  let [y, m] = keys[0].split('-').map(Number);
  const [lastY, lastM] = keys[keys.length - 1].split('-').map(Number);
  const out: InflowItem[] = [];
  while (y < lastY || (y === lastY && m <= lastM)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    out.push(byMonth.get(key) ?? { date: key, count: 0, black: 0, gray: 0 });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}
