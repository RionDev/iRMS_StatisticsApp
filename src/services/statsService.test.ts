import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@common/services/apiClient', () => ({ default: { get } }));

import * as svc from './statsService';

const B = '/api/stats/sample';

const cases: Array<[string, () => Promise<unknown>, string, Record<string, unknown> | undefined]> = [
  ['getSummary', () => svc.getSummary('week'), `${B}/summary`, { view: 'week' }],
  ['getInflow', () => svc.getInflow('total'), `${B}/inflow`, { view: 'total' }],
  ['getInflowToday', () => svc.getInflowToday(), `${B}/inflow/today`, undefined],
  ['getInflowHeatmap', () => svc.getInflowHeatmap('month'), `${B}/inflow/heatmap`, { view: 'month' }],
  ['getSource', () => svc.getSource('day'), `${B}/source`, { view: 'day', limit: 20 }],
  ['getLocale', () => svc.getLocale('week'), `${B}/locale`, { view: 'week', limit: 10 }],
  ['getFormat', () => svc.getFormat('week'), `${B}/format`, { view: 'week', limit: 8 }],
  ['getFormatCategory', () => svc.getFormatCategory(1, 'week'), `${B}/format/1/category`, { view: 'week' }],
  ['getFormatSpectype', () => svc.getFormatSpectype(2, 'month'), `${B}/format/2/spectype`, { view: 'month', limit: 10 }],
  ['getPe', () => svc.getPe('week'), `${B}/pe`, { view: 'week', limit: 10 }],
  ['getCompiler', () => svc.getCompiler('week'), `${B}/compiler`, { view: 'week', limit: 10 }],
  ['getLibrary', () => svc.getLibrary('week'), `${B}/library`, { view: 'week', limit: 10 }],
  ['getSize', () => svc.getSize('today'), `${B}/size`, { view: 'today' }],
  ['getDiag 전체', () => svc.getDiag('week'), `${B}/diag`, { view: 'week', limit: 20 }],
  ['getDiag 벤더', () => svc.getDiag('week', 3), `${B}/diag`, { view: 'week', limit: 20, vendor: 3 }],
  ['getVendorDetection', () => svc.getVendorDetection('total'), `${B}/vendor-detection`, { view: 'total' }],
  ['getRatio', () => svc.getRatio('week'), `${B}/ratio`, { view: 'week' }],
  ['getLabel', () => svc.getLabel('week'), `${B}/label`, { view: 'week', limit: 15 }],
  ['getTag', () => svc.getTag('week', 'cve'), `${B}/tag`, { view: 'week', group: 'cve', limit: 20 }],
  ['getTrend 기본', () => svc.getTrend('source'), `${B}/trend/source`, {}],
  ['getTrend diag', () => svc.getTrend('diag', { vendor: 1, limit: 20 }), `${B}/trend/diag`, { vendor: 1, limit: 20 }],
  ['getTrend category', () => svc.getTrend('category', { format: 1 }), `${B}/trend/category`, { format: 1 }],
  ['getMeta', () => svc.getMeta(), `${B}/meta`, undefined],
];

describe('statsService — API 스펙 §2.2 와 1:1', () => {
  beforeEach(() => get.mockReset());

  it.each(cases)('%s', async (_name, call, url, params) => {
    get.mockResolvedValueOnce({ data: { ok: true } });
    await expect(call()).resolves.toEqual({ ok: true });
    expect(get).toHaveBeenCalledWith(url, { params });
  });
});
