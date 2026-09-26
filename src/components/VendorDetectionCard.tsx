import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import { getVendorDetection } from '../services/statsService';
import type { View } from '../types/stats';
import { stackedBarOption } from '../utils/chartOptions';
import { toApiView } from '../utils/view';
import { BasisBadge, ChartCard } from './ChartCard';
import { EChart } from './EChart';
import { StatBody } from './StatBody';

const H = 280;

/** 9 vendor 별 탐지율 — 탐지/미탐 누적 + 유일 탐지. 급상승 없음 */
export function VendorDetectionCard({ view, style }: { view: View; style?: CSSProperties }) {
  const { theme } = useThemeStore();
  const apiView = toApiView(view);
  const state = useStat(() => getVendorDetection(apiView), [apiView]);
  const option = useMemo(() => {
    if (!state.data) return null;
    const items = state.data.items;
    return stackedBarOption(
      theme,
      items.map((i) => i.name),
      [
        { name: '탐지', values: items.map((i) => i.detected), color: theme.colors.primary },
        { name: '미탐', values: items.map((i) => i.missed), color: theme.colors.surfaceMuted },
      ],
      { horizontal: true, endLabels: items.map((i) => `유일 ${i.sole.toLocaleString()}`), labelWidth: 90 },
    );
  }, [state.data, theme]);
  return (
    <ChartCard title="vendor 별 탐지율" badge={view === 'rising' ? <BasisBadge>주간 기준</BasisBadge> : undefined} style={style}>
      <StatBody state={state} height={H} isEmpty={(d) => d.items.length === 0}>
        {() => option && <EChart option={option} height={H} />}
      </StatBody>
    </ChartCard>
  );
}
