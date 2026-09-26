import apiClient from '@common/services/apiClient';
import type {
  ApiView,
  DiagStats,
  Distribution,
  HeatmapStats,
  InflowStats,
  InflowTodayStats,
  LocaleItem,
  MetaStats,
  PeStats,
  RatioStats,
  SummaryStats,
  TagGroup,
  TrendKind,
  TrendParams,
  TrendStats,
  VendorDetectionStats,
} from '../types/stats';
import * as mock from './mock/mockStatsService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === '1';
const BASE = '/api/stats/sample';

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<T>(`${BASE}${path}`, { params });
  return res.data;
}

export function getSummary(view: ApiView): Promise<SummaryStats> {
  if (USE_MOCK) return mock.getSummary(view);
  return get('/summary', { view });
}

export function getInflow(view: ApiView): Promise<InflowStats> {
  if (USE_MOCK) return mock.getInflow(view);
  return get('/inflow', { view });
}

export function getInflowToday(): Promise<InflowTodayStats> {
  if (USE_MOCK) return mock.getInflowToday();
  return get('/inflow/today');
}

export function getInflowHeatmap(view: 'week' | 'month'): Promise<HeatmapStats> {
  if (USE_MOCK) return mock.getInflowHeatmap(view);
  return get('/inflow/heatmap', { view });
}

export function getSource(view: ApiView, limit = 20): Promise<Distribution> {
  if (USE_MOCK) return mock.getSource(view, limit);
  return get('/source', { view, limit });
}

export function getLocale(view: ApiView, limit = 10): Promise<Distribution<LocaleItem>> {
  if (USE_MOCK) return mock.getLocale(view, limit);
  return get('/locale', { view, limit });
}

export function getFormat(view: ApiView, limit = 8): Promise<Distribution> {
  if (USE_MOCK) return mock.getFormat(view, limit);
  return get('/format', { view, limit });
}

export function getFormatCategory(formatId: number, view: ApiView): Promise<Distribution> {
  if (USE_MOCK) return mock.getFormatCategory(formatId, view);
  return get(`/format/${formatId}/category`, { view });
}

export function getFormatSpectype(formatId: number, view: ApiView, limit = 10): Promise<Distribution> {
  if (USE_MOCK) return mock.getFormatSpectype(formatId, view, limit);
  return get(`/format/${formatId}/spectype`, { view, limit });
}

export function getPe(view: ApiView, limit = 10): Promise<PeStats> {
  if (USE_MOCK) return mock.getPe(view, limit);
  return get('/pe', { view, limit });
}

export function getCompiler(view: ApiView, limit = 10): Promise<Distribution> {
  if (USE_MOCK) return mock.getCompiler(view, limit);
  return get('/compiler', { view, limit });
}

export function getLibrary(view: ApiView, limit = 10): Promise<Distribution> {
  if (USE_MOCK) return mock.getLibrary(view, limit);
  return get('/library', { view, limit });
}

export function getSize(view: ApiView): Promise<Distribution> {
  if (USE_MOCK) return mock.getSize(view);
  return get('/size', { view });
}

/** vendor 생략 시 5벤더 합산 */
export function getDiag(view: ApiView, vendor?: number, limit = 20): Promise<DiagStats> {
  if (USE_MOCK) return mock.getDiag(view, vendor, limit);
  return get('/diag', vendor == null ? { view, limit } : { view, limit, vendor });
}

export function getVendorDetection(view: ApiView): Promise<VendorDetectionStats> {
  if (USE_MOCK) return mock.getVendorDetection(view);
  return get('/vendor-detection', { view });
}

export function getRatio(view: ApiView): Promise<RatioStats> {
  if (USE_MOCK) return mock.getRatio(view);
  return get('/ratio', { view });
}

export function getLabel(view: ApiView, limit = 15): Promise<Distribution> {
  if (USE_MOCK) return mock.getLabel(view, limit);
  return get('/label', { view, limit });
}

export function getTag(view: ApiView, group: TagGroup = 'general', limit = 20): Promise<Distribution> {
  if (USE_MOCK) return mock.getTag(view, group, limit);
  return get('/tag', { view, group, limit });
}

/** 급상승·신규 등장. category·spectype·overlay 는 format, diag 는 vendor 필수 */
export function getTrend(kind: TrendKind, params: TrendParams = {}): Promise<TrendStats> {
  if (USE_MOCK) return mock.getTrend(kind, params);
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  return get(`/trend/${kind}`, query);
}

export function getMeta(): Promise<MetaStats> {
  if (USE_MOCK) return mock.getMeta();
  return get('/meta');
}
