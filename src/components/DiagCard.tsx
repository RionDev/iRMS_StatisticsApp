import { useState } from 'react';
import type { CSSProperties } from 'react';
import { SearchSelect } from '@common/components/SearchSelect';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import { getDiag, getTrend, getVendorDetection } from '../services/statsService';
import type { View } from '../types/stats';
import { RankCard } from './RankCard';

const LIMIT = 20;

/** 8 vendor 별 진단명 — 목록은 전체(5벤더 합산)+벤더, 급상승은 벤더별만 */
export function DiagCard({ view, style }: { view: View; style?: CSSProperties }) {
  const { theme } = useThemeStore();
  const vendors = useStat(() => getVendorDetection('total'), []);
  const list = vendors.data?.items ?? [];
  const [vendor, setVendor] = useState<number | null>(null);
  const rising = view === 'rising';
  const effective = rising ? (vendor ?? list[0]?.id ?? null) : vendor;

  const controls = (
    <SearchSelect
      aria-label="벤더"
      value={effective ?? ''}
      disabled={list.length === 0}
      onChange={(e) => setVendor(e.target.value === '' ? null : Number(e.target.value))}
      style={{ minWidth: '160px' }}
    >
      {!rising && <option value="">전체</option>}
      {list.map((v) => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </SearchSelect>
  );

  return (
    <RankCard
      title="vendor 별 진단명"
      view={view}
      fetchList={(v) => getDiag(v, effective ?? undefined, LIMIT)}
      fetchTrend={() =>
        effective == null
          ? Promise.resolve({ kind: 'diag' as const, computed_date: null, window: null, rising: [], new: [] })
          : getTrend('diag', { vendor: effective, limit: LIMIT })
      }
      deps={[effective]}
      controls={controls}
      color={theme.colors.danger}
      labelWidth={220}
      height={400}
      style={style}
    />
  );
}
