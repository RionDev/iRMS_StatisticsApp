import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import type { ApiView, Distribution, Item, LocaleItem, TrendStats, View } from '../types/stats';
import { hBarOption } from '../utils/chartOptions';
import { formatCount } from '../utils/format';
import { toApiView } from '../utils/view';
import { ChartCard } from './ChartCard';
import { EChart } from './EChart';
import { StatBody } from './StatBody';
import { TrendPanel } from './TrendTable';

type ListData = Distribution<Item | LocaleItem>;

interface RankCardProps {
  title: string;
  view: View;
  fetchList: (view: ApiView) => Promise<ListData>;
  fetchTrend: () => Promise<TrendStats>;
  /** 카드 안 선택기 값 — 바뀌면 다시 부른다 */
  deps?: unknown[];
  controls?: ReactNode;
  color?: string;
  labelWidth?: number;
  height?: number;
  style?: CSSProperties;
}

/** TOP-N 수평 막대 7종 공통. 급상승 보기에서는 급상승/신규 등장 표 */
export function RankCard({ title, view, fetchList, fetchTrend, deps = [], controls, color, labelWidth = 120, height = 320, style }: RankCardProps) {
  return (
    <ChartCard title={title} controls={controls} style={style}>
      {view === 'rising' ? (
        <TrendPanel fetchTrend={fetchTrend} deps={deps} height={height} />
      ) : (
        <ListBody view={toApiView(view)} fetchList={fetchList} deps={deps} color={color} labelWidth={labelWidth} height={height} />
      )}
    </ChartCard>
  );
}

interface ListBodyProps {
  view: ApiView;
  fetchList: (view: ApiView) => Promise<ListData>;
  deps: unknown[];
  color?: string;
  labelWidth: number;
  height: number;
}

function ListBody({ view, fetchList, deps, color, labelWidth, height }: ListBodyProps) {
  const { theme } = useThemeStore();
  const state = useStat(() => fetchList(view), [view, ...deps]);
  const option = useMemo(
    () => (state.data ? hBarOption(theme, state.data.items, color ?? theme.colors.primary, labelWidth) : null),
    [state.data, theme, color, labelWidth],
  );
  return (
    <StatBody state={state} height={height} isEmpty={(d) => d.items.length === 0}>
      {(d) => (
        <>
          {option && <EChart option={option} height={height} />}
          {d.others > 0 && (
            <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.textMuted, textAlign: 'right' }}>기타 {formatCount(d.others)}건</div>
          )}
        </>
      )}
    </StatBody>
  );
}
