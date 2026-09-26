import { describe, expect, it } from 'vitest';
import { darkTheme, lightTheme } from '@common/styles/theme';
import { hBarOption, heatmapOption, stackedBarOption, vBarOption } from './chartOptions';

type Opt = Record<string, any>;

describe('chartOptions', () => {
  it('hBarOption 은 오름차순(ECharts 아래→위)이고 id 를 싣는다', () => {
    const o = hBarOption(lightTheme, [
      { id: 1, name: 'A', count: 5 },
      { id: 2, name: 'B', count: 1 },
    ], lightTheme.colors.primary) as Opt;
    expect(o.yAxis.data).toEqual(['B', 'A']);
    expect(o.series[0].data).toEqual([{ value: 1, id: 2 }, { value: 5, id: 1 }]);
    expect(o.series[0].itemStyle.color).toBe(lightTheme.colors.primary);
  });
  it('hBarOption 빈 입력', () => {
    const o = hBarOption(lightTheme, [], lightTheme.colors.primary) as Opt;
    expect(o.series[0].data).toEqual([]);
  });
  it('vBarOption', () => {
    const o = vBarOption(lightTheme, ['0시', '1시'], [3, 4], lightTheme.colors.warning, 30) as Opt;
    expect(o.xAxis.data).toEqual(['0시', '1시']);
    expect(o.xAxis.axisLabel.rotate).toBe(30);
    expect(o.series[0].data).toEqual([3, 4]);
  });
  it('stackedBarOption 은 같은 stack 키, 가로면 축이 바뀌고 endLabels 는 마지막 시리즈에', () => {
    const o = stackedBarOption(darkTheme, ['x', 'y'], [
      { name: 'Black', values: [1, 2], color: darkTheme.colors.danger },
      { name: 'Gray', values: [3, 4], color: darkTheme.colors.textMuted },
    ], { horizontal: true, endLabels: ['e1', 'e2'] }) as Opt;
    expect(o.yAxis.data).toEqual(['x', 'y']);
    expect(o.series.map((s: Opt) => s.stack)).toEqual(['total', 'total']);
    expect(o.series[1].itemStyle.color).toBe(darkTheme.colors.textMuted);
    expect(o.series[1].label.show).toBe(true);
    expect(o.series[0].label?.show ?? false).toBe(false);
  });
  it('heatmapOption 은 168칸, 다크 토큰 색 범위, 전부 0 이면 max 1', () => {
    const cells = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    const o = heatmapOption(darkTheme, cells) as Opt;
    expect(o.series[0].data).toHaveLength(168);
    expect(o.visualMap.inRange.color).toEqual([darkTheme.colors.surfaceMuted, darkTheme.colors.primary]);
    expect(o.visualMap.max).toBe(1);
    expect(o.yAxis.data).toEqual(['월', '화', '수', '목', '금', '토', '일']);
  });
});
