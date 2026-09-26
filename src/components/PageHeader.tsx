import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import { getMeta, getSummary, getTrend } from '../services/statsService';
import type { View } from '../types/stats';
import { formatCount, formatJobTime, formatRange, formatRatio, formatWindow } from '../utils/format';
import { isActiveFailure } from '../utils/meta';
import { toApiView } from '../utils/view';
import { KpiCard } from './KpiCard';
import { ViewSelector } from './ViewSelector';

interface PageHeaderProps {
  view: View;
  onViewChange: (v: View) => void;
}

/** 보기 선택 + 기간 문구 + 집계 시각 + KPI 줄 — 세 페이지 공통 */
export function PageHeader({ view, onViewChange }: PageHeaderProps) {
  const { theme } = useThemeStore();
  const apiView = toApiView(view);
  const rising = view === 'rising';

  const period = useStat(() => getSummary(apiView), [apiView]);
  const total = useStat(() => getSummary('total'), []);
  const meta = useStat(getMeta, []);
  const trendWindow = useStat(() => (rising ? getTrend('source', { limit: 1 }) : Promise.resolve(null)), [rising]);

  const periodText = rising
    ? trendWindow.data
      ? formatWindow(trendWindow.data.window)
      : ''
    : period.data
      ? formatRange(view, period.data.range)
      : '';
  const p = period.data;
  const basis = rising ? '주간 기준' : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <ViewSelector view={view} onChange={onViewChange} />
        <span style={{ fontSize: theme.fontSize.base, color: theme.colors.text, fontWeight: 600 }}>{periodText}</span>
        {meta.data && (
          <span style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: theme.fontSize.sm }}>
            {meta.data.hourly_last_ok && (
              <span style={{ color: theme.colors.textMuted }}>{formatJobTime(meta.data.hourly_last_ok)} 집계</span>
            )}
            {meta.data.last_failed && isActiveFailure(meta.data) && (
              <span style={{ color: theme.colors.warning }}>
                최근 집계 실패: {meta.data.last_failed.job} {meta.data.last_failed.finished_at?.replace('T', ' ').slice(0, 16) ?? ''}
              </span>
            )}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <KpiCard label="전체 샘플" value={formatCount(total.data?.total_samples)} />
        <KpiCard label="기간 등록" value={formatCount(p?.registered)} sub={basis} accentColor={theme.colors.primary} />
        <KpiCard label="Black 비율" value={formatRatio(p?.black_ratio)} sub={basis} accentColor={theme.colors.danger} />
        <KpiCard label="미진단" value={formatCount(p?.undetected)} sub={basis} accentColor={theme.colors.warning} />
        <KpiCard label="전 벤더 일치" value={formatCount(p?.all_detected)} sub={basis} />
        <KpiCard label="전 벤더 미탐" value={formatCount(p?.none_detected)} sub={basis} />
      </div>
    </div>
  );
}
