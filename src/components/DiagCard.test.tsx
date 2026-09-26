// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./EChart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./EChart')>();
  return { ...actual, EChart: () => <div data-testid="echart" /> };
});
vi.mock('../services/statsService', () => ({
  getVendorDetection: vi.fn(),
  getDiag: vi.fn(),
  getTrend: vi.fn(),
}));

import * as svc from '../services/statsService';
import { DiagCard } from './DiagCard';

const env = { view: 'total' as const, range: null, computed_at: null };

describe('DiagCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(svc.getVendorDetection).mockResolvedValue({
      ...env,
      items: [
        { id: 1, name: 'AhnLab', detected: 1, missed: 0, sole: 0 },
        { id: 2, name: 'Kaspersky', detected: 1, missed: 0, sole: 0 },
      ],
    });
    vi.mocked(svc.getDiag).mockResolvedValue({ ...env, vendor: null, items: [{ id: 5, name: 'Trojan.X', count: 3 }], others: 0 });
    vi.mocked(svc.getTrend).mockResolvedValue({ kind: 'diag', computed_date: '2026-09-27', window: null, rising: [], new: [] });
  });

  it('목록 모드는 "전체"(vendor 없음)로 시작한다', async () => {
    render(<DiagCard view="week" />);
    const select = await screen.findByRole('combobox', { name: '벤더' });
    await waitFor(() => expect(within(select).getByRole('option', { name: 'AhnLab' })).toBeInTheDocument());
    expect(within(select).getByRole('option', { name: '전체' })).toBeInTheDocument();
    expect(svc.getDiag).toHaveBeenCalledWith('week', undefined, 20);
  });

  it('급상승 모드는 "전체"를 빼고 첫 벤더로 부른다', async () => {
    render(<DiagCard view="rising" />);
    const select = await screen.findByRole('combobox', { name: '벤더' });
    await waitFor(() => expect(svc.getTrend).toHaveBeenCalledWith('diag', { vendor: 1, limit: 20 }));
    expect(within(select).queryByRole('option', { name: '전체' })).toBeNull();
    expect(select).toHaveValue('1');
  });

  it('급상승 모드: 벤더 목록 로딩 중에는 로딩 문구', async () => {
    vi.mocked(svc.getVendorDetection).mockImplementation(() => new Promise(() => undefined));
    render(<DiagCard view="rising" />);
    expect(await screen.findByText('로딩 중...')).toBeInTheDocument();
    expect(svc.getTrend).not.toHaveBeenCalled();
  });

  it('급상승 모드: 벤더 목록 실패 시 다시 시도, 클릭하면 재호출하고 getTrend 는 vendor undefined 로 불리지 않는다', async () => {
    vi.mocked(svc.getVendorDetection).mockRejectedValue(new Error('x'));
    render(<DiagCard view="rising" />);
    const retry = await screen.findByRole('button', { name: '다시 시도' });
    expect(svc.getTrend).not.toHaveBeenCalled();

    vi.mocked(svc.getVendorDetection).mockResolvedValue({
      ...env,
      items: [{ id: 1, name: 'AhnLab', detected: 1, missed: 0, sole: 0 }],
    });
    retry.click();
    await waitFor(() => expect(svc.getVendorDetection).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(svc.getTrend).toHaveBeenCalledWith('diag', { vendor: 1, limit: 20 }));
    for (const call of vi.mocked(svc.getTrend).mock.calls) {
      expect(call[1]?.vendor).not.toBeUndefined();
    }
  });

  it('급상승 모드: 벤더 목록이 비어 있으면 빈 상태 문구', async () => {
    vi.mocked(svc.getVendorDetection).mockResolvedValue({ ...env, items: [] });
    render(<DiagCard view="rising" />);
    expect(await screen.findByText('해당 기간 데이터가 없습니다')).toBeInTheDocument();
    expect(svc.getTrend).not.toHaveBeenCalled();
  });
});
