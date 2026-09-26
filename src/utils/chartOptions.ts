import type { EChartsCoreOption } from 'echarts/core';
import type { Theme } from '@common/styles/theme';
import { axisStyle, baseChartOption } from '../components/EChart';

export interface BarItem {
  id?: number;
  name: string;
  count: number;
  full_name?: string | null;
}

export interface StackSeries {
  name: string;
  values: number[];
  color: string;
}

const valueLabel = (theme: Theme) => ({
  show: true,
  position: 'right' as const,
  color: theme.colors.textMuted,
  fontSize: 10,
  formatter: ({ value }: { value: number }) => value.toLocaleString(),
});

/** TOP-N 수평 막대. 큰 값이 위(ECharts 는 아래→위라 오름차순 정렬). data 에 id 를 실어 클릭에 쓴다 */
export function hBarOption(theme: Theme, items: BarItem[], color: string, labelWidth = 80): EChartsCoreOption {
  const sorted = [...items].sort((a, b) => a.count - b.count);
  return {
    ...baseChartOption(theme),
    tooltip: {
      ...(baseChartOption(theme).tooltip as object),
      formatter: (ps: Array<{ dataIndex: number }> | { dataIndex: number }) => {
        const p = Array.isArray(ps) ? ps[0] : ps;
        const it = sorted[p.dataIndex];
        if (!it) return '';
        const label = it.full_name ? `${it.full_name} (${it.name})` : it.name;
        return `${label}<br/>${it.count.toLocaleString()}`;
      },
    },
    grid: { left: labelWidth + 16, right: 56, top: 8, bottom: 24 },
    xAxis: { type: 'value', ...axisStyle(theme) },
    yAxis: {
      type: 'category',
      data: sorted.map((b) => b.name),
      ...axisStyle(theme),
      axisLabel: { color: theme.colors.textMuted, fontSize: 11, width: labelWidth, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((b) => ({ value: b.count, id: b.id })),
        itemStyle: { color, borderRadius: [0, 3, 3, 0] },
        barMaxWidth: 18,
        label: valueLabel(theme),
      },
    ],
  };
}

/** 세로 막대 (시간대 · 크기 구간 · 진단율 구간) */
export function vBarOption(theme: Theme, labels: string[], values: number[], color: string, rotate = 0): EChartsCoreOption {
  return {
    ...baseChartOption(theme),
    grid: { left: 48, right: 16, top: 16, bottom: rotate ? 48 : 28 },
    xAxis: {
      type: 'category',
      data: labels,
      ...axisStyle(theme),
      axisLabel: { color: theme.colors.textMuted, fontSize: 11, rotate },
    },
    yAxis: { type: 'value', ...axisStyle(theme) },
    series: [{ type: 'bar', data: values, itemStyle: { color, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28 }],
  };
}

/** 누적 막대 (pool Black/Gray, 벤더 탐지/미탐) */
export function stackedBarOption(
  theme: Theme,
  labels: string[],
  series: StackSeries[],
  opts: { horizontal?: boolean; endLabels?: string[]; labelWidth?: number } = {},
): EChartsCoreOption {
  const { horizontal = false, endLabels, labelWidth = 80 } = opts;
  const category = { type: 'category', data: labels, ...axisStyle(theme) };
  const value = { type: 'value', ...axisStyle(theme) };
  return {
    ...baseChartOption(theme),
    legend: { top: 0, right: 0, textStyle: { color: theme.colors.textMuted, fontSize: 11 } },
    grid: horizontal
      ? { left: labelWidth + 16, right: endLabels ? 88 : 24, top: 28, bottom: 24 }
      : { left: 48, right: 16, top: 32, bottom: 28 },
    xAxis: horizontal ? value : category,
    yAxis: horizontal ? category : value,
    series: series.map((s, i) => ({
      type: 'bar',
      name: s.name,
      stack: 'total',
      data: s.values,
      itemStyle: { color: s.color },
      barMaxWidth: horizontal ? 18 : 28,
      ...(endLabels && i === series.length - 1
        ? {
            label: {
              show: true,
              position: 'right',
              color: theme.colors.textMuted,
              fontSize: 10,
              formatter: ({ dataIndex }: { dataIndex: number }) => endLabels[dataIndex] ?? '',
            },
          }
        : {}),
    })),
  };
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

/** 요일(월=0) × 시(0..23) 히트맵 */
export function heatmapOption(theme: Theme, cells: number[][]): EChartsCoreOption {
  const data: [number, number, number][] = [];
  cells.forEach((row, d) => row.forEach((v, h) => data.push([h, d, v])));
  const max = Math.max(1, ...data.map((c) => c[2]));
  return {
    ...baseChartOption(theme),
    tooltip: {
      ...(baseChartOption(theme).tooltip as object),
      trigger: 'item',
      formatter: ({ value }: { value: [number, number, number] }) =>
        `${DAYS[value[1]]} ${value[0]}시<br/>${value[2].toLocaleString()}`,
    },
    grid: { left: 40, right: 16, top: 8, bottom: 48 },
    xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, h) => `${h}`), ...axisStyle(theme), splitArea: { show: false } },
    yAxis: { type: 'category', data: DAYS, ...axisStyle(theme), inverse: true },
    visualMap: {
      min: 0,
      max,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemHeight: 120,
      textStyle: { color: theme.colors.textMuted, fontSize: 10 },
      inRange: { color: [theme.colors.surfaceMuted, theme.colors.primary] },
    },
    series: [{ type: 'heatmap', data, itemStyle: { borderColor: theme.colors.surface, borderWidth: 1 } }],
  };
}
