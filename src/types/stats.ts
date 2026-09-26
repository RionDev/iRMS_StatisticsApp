/** stats_service 응답 계약 — docs/superpowers/specs/2026-09-26-stats-service-api-design.md §2 */

export type ApiView = 'today' | 'day' | 'week' | 'month' | 'total';
/** 화면 보기. rising 은 FE 전용 — 카드가 /trend/{kind} 를 부른다 */
export type View = ApiView | 'rising';
export type TagGroup = 'general' | 'cve';
export type TrendKind =
  | 'source' | 'locale' | 'format' | 'category' | 'spectype' | 'overlay'
  | 'compiler' | 'library' | 'diag' | 'label' | 'tag';

export interface DateRange {
  from: string;
  to: string;
}

/** 공통 봉투 */
export interface Envelope {
  view: ApiView;
  /** total 이면 null */
  range: DateRange | null;
  computed_at: string | null;
}

export interface Item {
  id: number;
  name: string;
  count: number;
}

export interface LocaleItem extends Item {
  full_name: string | null;
}

export interface Distribution<T extends Item = Item> extends Envelope {
  items: T[];
  /** limit 초과분 합 */
  others: number;
}

export interface VendorRef {
  id: number;
  name: string;
}

export interface DiagStats extends Distribution {
  /** null 이면 5벤더 합산 */
  vendor: VendorRef | null;
}

export interface PeStats extends Envelope {
  category: Item[];
  spectype: Item[];
  overlay: Item[];
}

export interface VendorDetectionItem {
  id: number;
  name: string;
  detected: number;
  missed: number;
  /** 그 벤더만 잡은 샘플 수 */
  sole: number;
}

export interface VendorDetectionStats extends Envelope {
  items: VendorDetectionItem[];
}

export interface RatioBucket {
  id: number;
  range: string;
  count: number;
}

export interface RatioStats extends Envelope {
  buckets: RatioBucket[];
  undetected: number;
  all_detected: number;
  none_detected: number;
}

export interface SummaryStats extends Envelope {
  /** 주의: API 는 기간 등록 수를 돌려준다(registered 와 같음). 전체 누적은 view=total 로 부른다 */
  total_samples: number;
  registered: number;
  /** 0..1 */
  black_ratio: number | null;
  undetected: number;
  all_detected: number;
  none_detected: number;
}

export interface InflowItem {
  /** YYYY-MM-DD, total 이면 YYYY-MM */
  date: string;
  count: number;
  black: number;
  gray: number;
}

export interface InflowStats extends Envelope {
  items: InflowItem[];
}

export interface HourItem {
  hour: number;
  count: number;
}

export interface InflowTodayStats extends Envelope {
  items: HourItem[];
}

export interface HeatmapStats extends Envelope {
  /** [요일 0=월..6][시 0..23] */
  cells: number[][];
}

export interface TrendItem {
  id: number;
  name: string;
  rank: number;
  cur_count: number;
  prev_count: number;
  /** 신규 등장은 null */
  growth_pct: number | null;
}

export interface TrendWindow {
  cur: DateRange;
  prev: DateRange;
}

export interface TrendStats {
  kind: TrendKind;
  computed_date: string | null;
  window: TrendWindow | null;
  rising: TrendItem[];
  new: TrendItem[];
}

export interface TrendParams {
  format?: number;
  vendor?: number;
  group?: TagGroup;
  limit?: number;
}

export interface FailedJob {
  job: string;
  finished_at: string | null;
  message: string | null;
}

export interface MetaStats {
  hourly_last_ok: string | null;
  daily_last_ok: string | null;
  last_failed: FailedJob | null;
  lookups_loaded_at: string | null;
}
