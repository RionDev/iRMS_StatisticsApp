import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { SearchSelect } from '@common/components/SearchSelect';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import { getFormat, getFormatCategory, getFormatSpectype, getTrend } from '../services/statsService';
import type { ApiView, View } from '../types/stats';
import { hBarOption } from '../utils/chartOptions';
import { toApiView } from '../utils/view';
import { ChartCard, ChartState } from './ChartCard';
import { EChart, chartPalette } from './EChart';
import type { ChartClickParams } from './EChart';
import { StatBody } from './StatBody';
import { TrendPanel } from './TrendTable';

const H = 360;
const HALF = 170;
const LIMIT = 20;

/** 4 file_format 별 유입 — 포맷 → file_category · file_spectype 드릴다운 */
export function FormatDrillCard({ view, style }: { view: View; style?: CSSProperties }) {
  const { theme } = useThemeStore();
  const [selected, setSelected] = useState<number | null>(null);
  const formats = useStat(() => getFormat('total', 100), []);
  const rising = view === 'rising';
  const nameOf = (id: number) => formats.data?.items.find((f) => f.id === id)?.name ?? String(id);

  const controls = (
    <SearchSelect
      aria-label="포맷"
      value={selected ?? ''}
      onChange={(e) => setSelected(e.target.value === '' ? null : Number(e.target.value))}
      style={{ minWidth: '160px' }}
    >
      <option value="">전체 포맷</option>
      {(formats.data?.items ?? []).map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </SearchSelect>
  );

  const crumb = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginBottom: '8px' }}>
      <button
        type="button"
        onClick={() => setSelected(null)}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: theme.colors.primary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily }}
      >
        전체 포맷
      </button>
      {selected != null && <span style={{ color: theme.colors.text, fontWeight: 600 }}>› {nameOf(selected)}</span>}
    </div>
  );

  return (
    <ChartCard title="file_format 별 유입" controls={controls} style={style}>
      {crumb}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
        {rising ? (
          <TrendPanel fetchTrend={() => getTrend('format', { limit: LIMIT })} deps={[]} height={H} title="file_format" />
        ) : (
          <FormatList view={toApiView(view)} onSelect={setSelected} color={theme.colors.primary} />
        )}
        {selected == null ? (
          <ChartState height={H}>포맷을 선택하면 세부 분포가 열립니다</ChartState>
        ) : rising ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TrendPanel fetchTrend={() => getTrend('category', { format: selected, limit: LIMIT })} deps={[selected]} height={HALF} title="file_category" />
            <TrendPanel fetchTrend={() => getTrend('spectype', { format: selected, limit: LIMIT })} deps={[selected]} height={HALF} title="file_spectype" />
          </div>
        ) : (
          <FormatDetail formatId={selected} view={toApiView(view)} color={chartPalette(theme)[1]} />
        )}
      </div>
    </ChartCard>
  );
}

function FormatList({ view, onSelect, color }: { view: ApiView; onSelect: (id: number) => void; color: string }) {
  const { theme } = useThemeStore();
  const state = useStat(() => getFormat(view, 8), [view]);
  const option = useMemo(() => (state.data ? hBarOption(theme, state.data.items, color, 120) : null), [state.data, theme, color]);
  const handleClick = useCallback(
    (p: ChartClickParams) => {
      const id = (p.data as { id?: number } | null)?.id;
      if (id != null) onSelect(id);
    },
    [onSelect],
  );
  return (
    <StatBody state={state} height={H} isEmpty={(d) => d.items.length === 0}>
      {() => option && <EChart option={option} height={H} onClick={handleClick} />}
    </StatBody>
  );
}

function FormatDetail({ formatId, view, color }: { formatId: number; view: ApiView; color: string }) {
  const { theme } = useThemeStore();
  const category = useStat(() => getFormatCategory(formatId, view), [formatId, view]);
  const spectype = useStat(() => getFormatSpectype(formatId, view, 10), [formatId, view]);
  const catOption = useMemo(() => (category.data ? hBarOption(theme, category.data.items, color, 120) : null), [category.data, theme, color]);
  const specOption = useMemo(() => (spectype.data ? hBarOption(theme, spectype.data.items, color, 120) : null), [spectype.data, theme, color]);
  const sub = (text: string) => <span style={{ fontSize: theme.fontSize.sm, fontWeight: 600, color: theme.colors.textMuted }}>{text}</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
      {sub('file_category')}
      <StatBody state={category} height={HALF} isEmpty={(d) => d.items.length === 0}>
        {() => catOption && <EChart option={catOption} height={HALF} />}
      </StatBody>
      {sub('file_spectype TOP 10')}
      <StatBody state={spectype} height={HALF} isEmpty={(d) => d.items.length === 0}>
        {() => specOption && <EChart option={specOption} height={HALF} />}
      </StatBody>
    </div>
  );
}
