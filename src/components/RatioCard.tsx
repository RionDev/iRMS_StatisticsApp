import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import { getRatio } from '../services/statsService';
import type { View } from '../types/stats';
import { vBarOption } from '../utils/chartOptions';
import { toApiView } from '../utils/view';
import { BasisBadge, ChartCard } from './ChartCard';
import { EChart } from './EChart';
import { StatBody } from './StatBody';

const H = 280;

/** 10 detect_ratio 구간 — 미진단·전 벤더 일치·전 벤더 미탐은 KPI 줄에 있다. 급상승 없음 */
export function RatioCard({ view, style }: { view: View; style?: CSSProperties }) {
  const { theme } = useThemeStore();
  const apiView = toApiView(view);
  const state = useStat(() => getRatio(apiView), [apiView]);
  const option = useMemo(
    () =>
      state.data
        ? vBarOption(theme, state.data.buckets.map((b) => `${b.range}%`), state.data.buckets.map((b) => b.count), theme.colors.warning, 30)
        : null,
    [state.data, theme],
  );
  return (
    <ChartCard title="detect_ratio 구간" badge={view === 'rising' ? <BasisBadge>주간 기준</BasisBadge> : undefined} style={style}>
      <StatBody state={state} height={H} isEmpty={(d) => d.buckets.every((b) => b.count === 0)}>
        {() => option && <EChart option={option} height={H} />}
      </StatBody>
    </ChartCard>
  );
}
