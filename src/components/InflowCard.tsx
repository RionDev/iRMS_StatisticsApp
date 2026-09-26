import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useThemeStore } from '@common/stores/themeStore';
import type { Theme } from '@common/styles/theme';
import { useStat } from '../hooks/useStat';
import { getInflow, getInflowHeatmap, getInflowToday } from '../services/statsService';
import type { InflowItem, View } from '../types/stats';
import { heatmapOption, stackedBarOption, vBarOption } from '../utils/chartOptions';
import { fillMonths } from '../utils/fillMonths';
import { formatCount } from '../utils/format';
import { toApiView } from '../utils/view';
import { BasisBadge, ChartCard } from './ChartCard';
import { EChart } from './EChart';
import { StatBody } from './StatBody';

const H = 300;
const HEAT_H = 220;

function poolSeries(theme: Theme, items: InflowItem[]) {
  return [
    { name: 'Black', values: items.map((i) => i.black), color: theme.colors.danger },
    { name: 'Gray', values: items.map((i) => i.gray), color: theme.colors.textMuted },
  ];
}

/** 1 일일 유입 — 보기별로 시간별 / 어제 / 일별+히트맵 / 월별 */
export function InflowCard({ view, style }: { view: View; style?: CSSProperties }) {
  const apiView = toApiView(view);
  return (
    <ChartCard title="일일 유입" badge={view === 'rising' ? <BasisBadge>주간 기준</BasisBadge> : undefined} style={style}>
      {apiView === 'today' && <TodayBody />}
      {apiView === 'day' && <DayBody />}
      {(apiView === 'week' || apiView === 'month') && <RangeBody view={apiView} />}
      {apiView === 'total' && <TotalBody />}
    </ChartCard>
  );
}

function TodayBody() {
  const { theme } = useThemeStore();
  const state = useStat(getInflowToday, []);
  const option = useMemo(
    () =>
      state.data
        ? vBarOption(theme, state.data.items.map((i) => `${i.hour}시`), state.data.items.map((i) => i.count), theme.colors.primary)
        : null,
    [state.data, theme],
  );
  return (
    <StatBody state={state} height={H} isEmpty={(d) => d.items.every((i) => i.count === 0)}>
      {() => option && <EChart option={option} height={H} />}
    </StatBody>
  );
}

function DayBody() {
  const { theme } = useThemeStore();
  const state = useStat(() => getInflow('day'), []);
  const option = useMemo(
    () => (state.data ? stackedBarOption(theme, state.data.items.map((i) => i.date), poolSeries(theme, state.data.items), { horizontal: true }) : null),
    [state.data, theme],
  );
  return (
    <StatBody state={state} height={H} isEmpty={(d) => d.items.every((i) => i.count === 0)}>
      {(d) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: theme.colors.text }}>
            합계 {formatCount(d.items.reduce((s, i) => s + i.count, 0))}건
          </span>
          {option && <EChart option={option} height={120} />}
        </div>
      )}
    </StatBody>
  );
}

function RangeBody({ view }: { view: 'week' | 'month' }) {
  const { theme } = useThemeStore();
  const inflow = useStat(() => getInflow(view), [view]);
  const heat = useStat(() => getInflowHeatmap(view), [view]);
  const inflowOption = useMemo(
    () => (inflow.data ? stackedBarOption(theme, inflow.data.items.map((i) => i.date.slice(5)), poolSeries(theme, inflow.data.items)) : null),
    [inflow.data, theme],
  );
  const heatOption = useMemo(() => (heat.data ? heatmapOption(theme, heat.data.cells) : null), [heat.data, theme]);
  const inflowEmpty = inflow.data ? inflow.data.items.every((i) => i.count === 0) : false;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <StatBody state={inflow} height={H} isEmpty={(d) => d.items.every((i) => i.count === 0)}>
        {() => inflowOption && <EChart option={inflowOption} height={H} />}
      </StatBody>
      {!inflowEmpty && (
        <StatBody state={heat} height={HEAT_H}>
          {() => heatOption && <EChart option={heatOption} height={HEAT_H} />}
        </StatBody>
      )}
    </div>
  );
}

function TotalBody() {
  const { theme } = useThemeStore();
  const state = useStat(() => getInflow('total'), []);
  const option = useMemo(() => {
    if (!state.data) return null;
    const months = fillMonths(state.data.items);
    return stackedBarOption(theme, months.map((m) => m.date), poolSeries(theme, months));
  }, [state.data, theme]);
  return (
    <StatBody state={state} height={H} isEmpty={(d) => d.items.every((i) => i.count === 0)}>
      {() => option && <EChart option={option} height={H} />}
    </StatBody>
  );
}
