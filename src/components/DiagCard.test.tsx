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
});
