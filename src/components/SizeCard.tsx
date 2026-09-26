import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import { getSize } from '../services/statsService';
import type { View } from '../types/stats';
import { vBarOption } from '../utils/chartOptions';
import { toApiView } from '../utils/view';
import { BasisBadge, ChartCard } from './ChartCard';
import { EChart, chartPalette } from './EChart';
import { StatBody } from './StatBody';

const H = 280;

/** 7 file_size 구간 — 급상승 없음 */
export function SizeCard({ view, style }: { view: View; style?: CSSProperties }) {
  const { theme } = useThemeStore();
  const apiView = toApiView(view);
  const state = useStat(() => getSize(apiView), [apiView]);
  const option = useMemo(
    () => (state.data ? vBarOption(theme, state.data.items.map((i) => i.name), state.data.items.map((i) => i.count), chartPalette(theme)[2]) : null),
    [state.data, theme],
  );
  return (
    <ChartCard title="file_size 구간" badge={view === 'rising' ? <BasisBadge>주간 기준</BasisBadge> : undefined} style={style}>
      <StatBody state={state} height={H} isEmpty={(d) => d.items.every((i) => i.count === 0)}>
        {() => option && <EChart option={option} height={H} />}
      </StatBody>
    </ChartCard>
  );
}
