// statsService 의 UI 단독 개발용 mock 구현.
// 시드 고정 PRNG 로 세션 간 동일한 분포를 생성한다 (일별 추이만 오늘 기준 역산).

import type {
  DailyStats,
  DetectionRatioStats,
  LocalesStats,
  StatsBucket,
  StatsSummary,
  TopDetectionsStats,
  TypesStats,
  VendorOption,
} from '../../types/stats';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const VENDORS: VendorOption[] = [
  { id: 1, name: 'AhnLab' },
  { id: 2, name: 'Kaspersky' },
  { id: 3, name: 'BitDefender' },
  { id: 4, name: 'Microsoft' },
  { id: 5, name: 'ClamAV' },
];

// 일별 등록 추이 — 최근 365일, 주말 감소 + 완만한 추세 (시드 고정)
const DAY_MS = 24 * 60 * 60 * 1000;
const dailyRand = mulberry32(20260819);
const DAILY_ALL: { date: string; count: number }[] = (() => {
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 364; i >= 0; i -= 1) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const weekday = d.getDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.45 : 1;
    const trend = 1 + (364 - i) / 700; // 완만한 증가 추세
    const noise = 0.6 + dailyRand() * 0.8;
    const count = Math.round(120 * weekendFactor * trend * noise);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
    out.push({ date: iso, count });
  }
  return out;
})();

const TOTAL = 84_213 + DAILY_ALL.reduce((sum, b) => sum + b.count, 0);

function distribute(names: string[], total: number, seed: number, skew = 2.2): StatsBucket[] {
  const rand = mulberry32(seed);
  const weights = names.map((_, i) => Math.pow(names.length - i, skew) * (0.7 + rand() * 0.6));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  return names.map((name, i) => ({
    name,
    count: Math.max(1, Math.round((weights[i] / weightSum) * total)),
  }));
}

export async function getStatsSummary(): Promise<StatsSummary> {
  await delay(150);
  const last24h = DAILY_ALL[DAILY_ALL.length - 1].count;
  const last7d = DAILY_ALL.slice(-7).reduce((sum, b) => sum + b.count, 0);
  return {
    total_samples: TOTAL,
    last_24h: last24h,
    last_7d: last7d,
    avg_detect_ratio: 47,
    pools: [
      { name: 'Black', count: Math.round(TOTAL * 0.71) },
      { name: 'Gray', count: Math.round(TOTAL * 0.29) },
    ],
  };
}

export async function getDailyStats(days: number): Promise<DailyStats> {
  await delay(200);
  return { days, items: DAILY_ALL.slice(-days) };
}

export async function getTypesStats(): Promise<TypesStats> {
  await delay(200);
  return {
    formats: distribute(
      ['PE32', 'PE64', 'Text', 'Binary', 'ELF64', 'MSDOS', 'ELF32', 'Unknown'],
      TOTAL,
      11,
    ),
    categories: distribute(
      ['Unknown', 'Archive', 'Document', 'Installer', 'Script', 'Packer', 'Image', 'SFX'],
      TOTAL,
      22,
    ),
  };
}

export async function getLocalesStats(): Promise<LocalesStats> {
  await delay(200);
  return {
    items: distribute(['US', 'CN', 'KR', 'RU', '??', 'JP', 'DE', 'BR', 'IN', 'VN'], TOTAL, 33, 1.8),
  };
}

export async function getDetectionRatioStats(): Promise<DetectionRatioStats> {
  await delay(200);
  const rand = mulberry32(44);
  const ranges = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
  // 양극단이 두터운 U자 분포 (미진단 다수 + 고진단 다수)
  const weights = [3.2, 1.1, 0.8, 0.7, 0.8, 0.9, 1.1, 1.4, 1.9, 2.4];
  const weightSum = weights.reduce((a, b) => a + b, 0);
  return {
    buckets: ranges.map((range, i) => ({
      range,
      count: Math.round((weights[i] / weightSum) * TOTAL * (0.9 + rand() * 0.2)),
    })),
  };
}

const DIAG_BASE = [
  'Trojan.Win32.Agent', 'Trojan.Win32.Generic', 'Ransom.Win32.LockBit',
  'Worm.Win32.Zbot', 'Backdoor.MSIL.Njrat', 'Trojan.Script.Emotet',
  'Downloader.Win32.Qakbot', 'Spyware.MSIL.AgentTesla', 'Trojan.Win64.Redline',
  'Adware.Win32.Generic', 'Virus.Win32.Formbook', 'HackTool.Win32.Remcos',
  'Dropper.Win32.Conti', 'Trojan.Android.Agent', 'Worm.Linux.Generic',
  'Ransom.Win32.Wannacry', 'Backdoor.Win32.Gandcrab', 'Trojan.MSIL.Generic',
  'Downloader.Script.Agent', 'Spyware.Win32.Keylogger',
];

export async function getTopDetections(vendorId: number, limit = 20): Promise<TopDetectionsStats> {
  await delay(250);
  const vendor = VENDORS.find((v) => v.id === vendorId);
  if (!vendor) return { vendor_id: vendorId, items: [] };
  const rand = mulberry32(1000 + vendorId);
  const suffix = String.fromCharCode(97 + (vendorId % 26));
  const items = DIAG_BASE.map((base, index) => ({
    diag_id: index + 1,
    name: `${base}.${suffix}${String.fromCharCode(97 + Math.floor(rand() * 26))}`,
    count: Math.round(300 + rand() * 8000),
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return { vendor_id: vendorId, items };
}

export async function getVendors(): Promise<VendorOption[]> {
  await delay(100);
  return VENDORS;
}
