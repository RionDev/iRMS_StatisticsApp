import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';
import type { Theme } from '@common/styles/theme';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface EChartProps {
  option: EChartsCoreOption;
  height: number;
}

/** ECharts 캔버스 래퍼 — option 교체 시 전체 갱신(notMerge)으로 테마 전환에 대응 */
export function EChart({ option, height }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const chart = echarts.init(container);
    chartRef.current = chart;
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={containerRef} style={{ width: '100%', height: `${height}px` }} />;
}

/** 라이트/다크 공통 — theme 토큰 기반 ECharts 기본 옵션 조각 */
export function baseChartOption(theme: Theme): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: theme.colors.textMuted, fontFamily: theme.fontFamily },
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      textStyle: { color: theme.colors.text, fontSize: 12 },
    },
  };
}

export function axisStyle(theme: Theme) {
  return {
    axisLine: { lineStyle: { color: theme.colors.border } },
    axisTick: { lineStyle: { color: theme.colors.border } },
    axisLabel: { color: theme.colors.textMuted, fontSize: 11 },
    splitLine: { lineStyle: { color: theme.colors.border, opacity: 0.6 } },
  };
}

/** 파이/시리즈 다색 팔레트 — theme.md 승인 색상 (토큰 + 미토큰 승인 목록) */
export function chartPalette(theme: Theme): string[] {
  return [
    theme.colors.primary, // #2563eb
    '#0ea5e9', // info
    '#4f46e5', // accent
    theme.colors.success,
    theme.colors.warning,
    theme.colors.danger,
    '#93c5fd',
    '#a5b4fc',
    '#64748b',
    '#f59e0b',
  ];
}
