/** UI 단독 개발용 mock (VITE_USE_MOCK=1) — stats_service 응답 모양을 흉내 낸다 */
import type {
  ApiView,
  DateRange,
  DiagStats,
  Distribution,
  Envelope,
  HeatmapStats,
  InflowStats,
  InflowTodayStats,
  Item,
  LocaleItem,
  MetaStats,
  PeStats,
  RatioStats,
  SummaryStats,
  TagGroup,
  TrendItem,
  TrendKind,
  TrendParams,
  TrendStats,
  VendorDetectionStats,
} from '../../types/stats';

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 60 + Math.floor(Math.random() * 120)));
}

const DAY_MS = 86_400_000;
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);
const nowIso = () => new Date().toISOString().slice(0, 19);
const SPAN: Record<ApiView, number> = { today: 1, day: 1, week: 7, month: 30, total: 400 };

function rangeOf(view: ApiView): DateRange | null {
  switch (view) {
    case 'today':
      return { from: isoDate(daysAgo(0)), to: isoDate(daysAgo(0)) };
    case 'day':
      return { from: isoDate(daysAgo(1)), to: isoDate(daysAgo(1)) };
    case 'week':
      return { from: isoDate(daysAgo(7)), to: isoDate(daysAgo(1)) };
    case 'month':
      return { from: isoDate(daysAgo(30)), to: isoDate(daysAgo(1)) };
    default:
      return null;
  }
}

function envelope(view: ApiView): Envelope {
  return { view, range: rangeOf(view), computed_at: nowIso() };
}

const NAMES = {
  source: ['VirusTotal', 'MalwareBazaar', '고객 신고', '내부 수집', '허니팟', '파트너 공유'],
  locale: ['KR', 'US', 'CN', 'RU', 'JP', 'DE', 'BR', 'IN', 'VN', 'FR', 'GB', 'TR'],
  format: ['PE32', 'PE64', 'ELF', 'APK', 'PDF', 'DOCX', 'Script', 'PE32_AutoIt', 'ZIP', 'MSI'],
  category: ['Packer', 'Protector', 'Installer', 'SFX', 'Native', 'DotNet'],
  spectype: ['UPX', 'Themida', 'VMProtect', 'MPRESS', 'ASPack', 'Enigma', 'PECompact', 'NSPack', 'Obsidium', 'ConfuserEx', 'Petite'],
  overlay: ['NSIS', 'Inno Setup', '7z', 'ZIP', 'RAR', 'InstallShield', 'WiX', 'CAB', 'AutoIt', 'PyInstaller'],
  compiler: ['MSVC', 'MinGW', 'Delphi', 'Go', 'Rust', 'VB6', 'Nim', 'Borland C++', 'Clang', 'FASM', 'Zig'],
  library: ['.Net', 'Python', 'Electron', 'Qt', 'MFC', 'Java', 'Node', 'Lua', 'Tcl', 'wxWidgets', 'GTK'],
  label: ['trojan', 'ransomware', 'miner', 'stealer', 'backdoor', 'downloader', 'worm', 'adware', 'rootkit', 'spyware', 'dropper', 'hacktool', 'banker', 'exploit', 'virus', 'botnet'],
  general: ['agenttesla', 'formbook', 'lockbit', 'redline', 'upx', 'nsis', 'emotet', 'qakbot', 'njrat', 'remcos', 'lumma', 'vidar', 'asyncrat', 'raccoon', 'amadey', 'smokeloader', 'stealc', 'xworm', 'darkgate', 'pikabot', 'icedid'],
  cve: ['cve-2017-11882', 'cve-2021-40444', 'cve-2023-38831', 'cve-2022-30190', 'cve-2018-0802', 'cve-2021-44228', 'cve-2023-23397', 'cve-2024-21412', 'cve-2019-0708', 'cve-2020-0796', 'cve-2017-0199', 'cve-2024-3400', 'cve-2023-4966', 'cve-2022-41082', 'cve-2021-26855', 'cve-2023-36884', 'cve-2024-21762', 'cve-2023-27997', 'cve-2022-26134', 'cve-2021-34527', 'cve-2023-20198'],
  diag: ['Trojan.Win32.AgentTesla', 'Ransom.Win32.LockBit', 'Backdoor.MSIL.Remcos', 'Spyware.Win32.Redline', 'Trojan.Win32.Formbook', 'Dropper.Script.Emotet', 'Worm.Win32.Qakbot', 'Trojan.Android.Joker', 'Adware.Win32.Generic', 'HackTool.Win64.Mimikatz', 'Downloader.MSIL.Amadey', 'Stealer.Win32.Lumma', 'Trojan.Linux.Mirai', 'Virus.Win32.Sality', 'Backdoor.Win32.Cobalt', 'Trojan.Script.Agent', 'Miner.Win64.XMRig', 'Stealer.Win32.Vidar', 'Ransom.MSIL.Chaos', 'Worm.Script.Njrat', 'Trojan.Win32.Generic', 'Exploit.Doc.CVE-2017-11882'],
} as const;

const VENDORS = ['AhnLab', 'Kaspersky', 'BitDefender', 'Microsoft', 'ClamAV'];
const LOCALE_FULL: Record<string, string> = {
  KR: 'Korea, Republic of', US: 'United States', CN: 'China', RU: 'Russian Federation', JP: 'Japan', DE: 'Germany',
  BR: 'Brazil', IN: 'India', VN: 'Viet Nam', FR: 'France', GB: 'United Kingdom', TR: 'Türkiye',
};

function rank(names: readonly string[], view: ApiView, seed: number): Item[] {
  const rng = mulberry32(seed * 31 + SPAN[view]);
  const scale = SPAN[view] * 30;
  return names
    .map((name, i) => ({ id: i + 1, name, count: Math.max(1, Math.round((scale * (0.3 + rng())) / (i * 0.6 + 1))) }))
    .sort((a, b) => b.count - a.count);
}

function distribution(names: readonly string[], view: ApiView, seed: number, limit: number): Distribution {
  const all = rank(names, view, seed);
  return {
    ...envelope(view),
    items: all.slice(0, limit),
    others: all.slice(limit).reduce((sum, it) => sum + it.count, 0),
  };
}

function inflowItems(view: ApiView) {
  const rng = mulberry32(20260927 + SPAN[view]);
  const point = (date: string, base: number) => {
    const count = Math.round(base * (0.6 + rng() * 0.8));
    const black = Math.round(count * 0.7);
    return { date, count, black, gray: count - black };
  };
  if (view === 'total') {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return point(d.toISOString().slice(0, 7), 2400);
    });
  }
  const days = view === 'month' ? 30 : view === 'week' ? 7 : 1;
  const offset = view === 'today' ? 0 : 1;
  return Array.from({ length: days }, (_, i) => point(isoDate(daysAgo(days - i - 1 + offset)), 80));
}

export function getSummary(view: ApiView): Promise<SummaryStats> {
  const registered = inflowItems(view).reduce((s, it) => s + it.count, 0);
  return delay({
    ...envelope(view),
    total_samples: registered,
    registered,
    black_ratio: 0.71,
    undetected: Math.round(registered * 0.08),
    all_detected: Math.round(registered * 0.21),
    none_detected: Math.round(registered * 0.05),
  });
}

export function getInflow(view: ApiView): Promise<InflowStats> {
  return delay({ ...envelope(view), items: inflowItems(view) });
}

export function getInflowToday(): Promise<InflowTodayStats> {
  const rng = mulberry32(7);
  const hourNow = new Date().getHours();
  const items = Array.from({ length: 24 }, (_, hour) => ({ hour, count: hour > hourNow ? 0 : Math.round(rng() * 12) }));
  return delay({ ...envelope('today'), items });
}

export function getInflowHeatmap(view: 'week' | 'month'): Promise<HeatmapStats> {
  const rng = mulberry32(view === 'week' ? 11 : 13);
  const scale = view === 'week' ? 6 : 24;
  const cells = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => Math.round(rng() * scale * (d < 5 ? 1 : 0.4) * (h >= 9 && h <= 18 ? 1.5 : 0.6))),
  );
  return delay({ ...envelope(view), cells });
}

export function getSource(view: ApiView, limit = 20) {
  return delay(distribution(NAMES.source, view, 1, limit));
}

export function getLocale(view: ApiView, limit = 10): Promise<Distribution<LocaleItem>> {
  const d = distribution(NAMES.locale, view, 2, limit);
  return delay({ ...d, items: d.items.map((it) => ({ ...it, full_name: LOCALE_FULL[it.name] ?? null })) });
}

export function getFormat(view: ApiView, limit = 8) {
  return delay(distribution(NAMES.format, view, 3, limit));
}

export function getFormatCategory(formatId: number, view: ApiView) {
  return delay(distribution(NAMES.category, view, 40 + formatId, 100));
}

export function getFormatSpectype(formatId: number, view: ApiView, limit = 10) {
  return delay(distribution(NAMES.spectype, view, 50 + formatId, limit));
}

export function getPe(view: ApiView, limit = 10): Promise<PeStats> {
  return delay({
    ...envelope(view),
    category: rank(NAMES.category, view, 5).slice(0, limit),
    spectype: rank(NAMES.spectype, view, 6).slice(0, limit),
    overlay: rank(NAMES.overlay, view, 7).slice(0, limit),
  });
}

export function getCompiler(view: ApiView, limit = 10) {
  return delay(distribution(NAMES.compiler, view, 8, limit));
}

export function getLibrary(view: ApiView, limit = 10) {
  return delay(distribution(NAMES.library, view, 9, limit));
}

export function getSize(view: ApiView): Promise<Distribution> {
  const labels = ['<100K', '<1M', '<10M', '<50M', '≥50M'];
  const rng = mulberry32(10 + SPAN[view]);
  const items = labels.map((name, id) => ({ id, name, count: Math.round(SPAN[view] * 20 * (0.2 + rng()) * (id === 1 ? 2 : 1)) }));
  return delay({ ...envelope(view), items, others: 0 });
}

export function getDiag(view: ApiView, vendor?: number, limit = 20): Promise<DiagStats> {
  const d = distribution(NAMES.diag, view, 100 + (vendor ?? 0), limit);
  return delay({ ...d, vendor: vendor == null ? null : { id: vendor, name: VENDORS[vendor - 1] ?? String(vendor) } });
}

export function getVendorDetection(view: ApiView): Promise<VendorDetectionStats> {
  const rng = mulberry32(12 + SPAN[view]);
  const total = SPAN[view] * 80;
  const items = VENDORS.map((name, i) => {
    const detected = Math.round(total * (0.5 + rng() * 0.45));
    return { id: i + 1, name, detected, missed: total - detected, sole: Math.round(rng() * total * 0.03) };
  });
  return delay({ ...envelope(view), items });
}

export function getRatio(view: ApiView): Promise<RatioStats> {
  const rng = mulberry32(14 + SPAN[view]);
  const buckets = Array.from({ length: 10 }, (_, id) => ({
    id,
    range: `${id * 10}-${id * 10 + 10}`,
    count: Math.round(SPAN[view] * 10 * (id === 0 || id === 9 ? 3 : 1) * (0.5 + rng())),
  }));
  const sum = buckets.reduce((s, b) => s + b.count, 0);
  return delay({
    ...envelope(view),
    buckets,
    undetected: Math.round(sum * 0.08),
    all_detected: Math.round(sum * 0.21),
    none_detected: Math.round(sum * 0.05),
  });
}

export function getLabel(view: ApiView, limit = 15) {
  return delay(distribution(NAMES.label, view, 15, limit));
}

export function getTag(view: ApiView, group: TagGroup = 'general', limit = 20) {
  return delay(distribution(group === 'cve' ? NAMES.cve : NAMES.general, view, group === 'cve' ? 17 : 16, limit));
}

const TREND_NAMES: Record<TrendKind, readonly string[]> = {
  source: NAMES.source, locale: NAMES.locale, format: NAMES.format, category: NAMES.category,
  spectype: NAMES.spectype, overlay: NAMES.overlay, compiler: NAMES.compiler, library: NAMES.library,
  diag: NAMES.diag, label: NAMES.label, tag: NAMES.general,
};

export function getTrend(kind: TrendKind, params: TrendParams = {}): Promise<TrendStats> {
  const names = kind === 'tag' && params.group === 'cve' ? NAMES.cve : TREND_NAMES[kind];
  const limit = params.limit ?? 20;
  const rng = mulberry32(kind.length * 97 + (params.format ?? 0) + (params.vendor ?? 0) * 7);
  const half = Math.ceil(names.length / 2);
  const ranked = (items: TrendItem[]) => items.slice(0, limit).map((it, i) => ({ ...it, rank: i + 1 }));
  const rising = ranked(
    names
      .slice(0, half)
      .map((name, i) => {
        const prev = 10 + Math.round(rng() * 40);
        const cur = prev + 5 + Math.round(rng() * 80);
        return { id: i + 1, name, rank: 0, cur_count: cur, prev_count: prev, growth_pct: Math.round(((cur - prev) / prev) * 10000) / 100 };
      })
      .sort((a, b) => (b.growth_pct ?? 0) - (a.growth_pct ?? 0)),
  );
  const fresh = ranked(
    names
      .slice(half)
      .map((name, i) => ({ id: half + i + 1, name, rank: 0, cur_count: 10 + Math.round(rng() * 30), prev_count: 0, growth_pct: null }))
      .sort((a, b) => b.cur_count - a.cur_count),
  );
  return delay({
    kind,
    computed_date: isoDate(daysAgo(0)),
    window: {
      cur: { from: isoDate(daysAgo(7)), to: isoDate(daysAgo(1)) },
      prev: { from: isoDate(daysAgo(14)), to: isoDate(daysAgo(8)) },
    },
    rising,
    new: fresh,
  });
}

export function getMeta(): Promise<MetaStats> {
  return delay({ hourly_last_ok: nowIso(), daily_last_ok: nowIso(), last_failed: null, lookups_loaded_at: nowIso() });
}
