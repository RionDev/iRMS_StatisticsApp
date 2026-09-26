// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const options: unknown[] = [];
vi.mock('./EChart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./EChart')>();
  return {
    ...actual,
    EChart: ({ option }: { option: unknown }) => {
      options.push(option);
      return <div data-testid="echart" />;
    },
  };
});
vi.mock('../services/statsService', () => ({ getVendorDetection: vi.fn(), getRatio: vi.fn() }));

import * as svc from '../services/statsService';
import { RatioCard } from './RatioCard';
import { VendorDetectionCard } from './VendorDetectionCard';

const env = { view: 'week' as const, range: null, computed_at: null };

describe('진단 전용 카드', () => {
  beforeEach(() => {
    options.length = 0;
    vi.clearAllMocks();
    vi.mocked(svc.getVendorDetection).mockResolvedValue({ ...env, items: [{ id: 1, name: 'AhnLab', detected: 8, missed: 2, sole: 3 }] });
    vi.mocked(svc.getRatio).mockResolvedValue({
      ...env,
      buckets: Array.from({ length: 10 }, (_, id) => ({ id, range: `${id * 10}-${id * 10 + 10}`, count: id })),
      undetected: 0,
      all_detected: 0,
      none_detected: 0,
    });
  });

  it('벤더별 탐지율: 급상승이면 주간 + 배지, 유일 탐지 라벨', async () => {
    render(<VendorDetectionCard view="rising" />);
    expect(await screen.findByText('주간 기준')).toBeInTheDocument();
    await screen.findByTestId('echart');
    expect(svc.getVendorDetection).toHaveBeenCalledWith('week');
    const o = options[0] as { series: Array<{ label?: { formatter: (p: { dataIndex: number }) => string } }> };
    expect(o.series[1].label!.formatter({ dataIndex: 0 })).toBe('유일 3');
  });

  it('진단율 구간: 10구간', async () => {
    render(<RatioCard view="month" />);
    await screen.findByTestId('echart');
    await waitFor(() => expect(svc.getRatio).toHaveBeenCalledWith('month'));
    const o = options[0] as { xAxis: { data: string[] } };
    expect(o.xAxis.data).toHaveLength(10);
  });
});
