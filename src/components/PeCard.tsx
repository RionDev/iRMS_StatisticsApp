import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { SearchSelect } from '@common/components/SearchSelect';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import { getPe, getTrend } from '../services/statsService';
import type { Item, View } from '../types/stats';
import { hBarOption } from '../utils/chartOptions';
import { toApiView } from '../utils/view';
import { ChartCard, ChartState } from './ChartCard';
import { EChart, chartPalette } from './EChart';
import { StatBody } from './StatBody';
import { TrendPanel } from './TrendTable';

const H = 280;
const LIMIT = 20;

/** photon seed lookup_sample_type_format · stats_service PE_FORMAT_IDS 와 같다 */
export const PE_FORMATS = [
  { id: 1, name: 'PE32' },
  { id: 2, name: 'PE64' },
  { id: 3, name: 'PE32_AutoHotKey' },
  { id: 4, name: 'PE64_AutoHotKey' },
  { id: 5, name: 'PE32_AutoIt' },
  { id: 6, name: 'PE64_AutoIt' },
];

const PANELS = [
  { key: 'category', title: 'file_category' },
  { key: 'spectype', title: 'file_spectype' },
  { key: 'overlay', title: 'file_overlay' },
] as const;

/** 5 PE 세부 — 목록은 PE 6종 합산, 급상승은 포맷별 */
export function PeCard({ view, style }: { view: View; style?: CSSProperties }) {
  const rising = view === 'rising';
  const [format, setFormat] = useState(PE_FORMATS[0].id);
  const controls = rising ? (
    <SearchSelect aria-label="PE 포맷" value={format} onChange={(e) => setFormat(Number(e.target.value))} style={{ minWidth: '160px' }}>
      {PE_FORMATS.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </SearchSelect>
  ) : undefined;

  return (
    <ChartCard title="PE 세부 (file_category · file_spectype · file_overlay)" controls={controls} style={style}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
        {rising
          ? PANELS.map((p) => (
              <TrendPanel key={p.key} title={p.title} fetchTrend={() => getTrend(p.key, { format, limit: LIMIT })} deps={[format]} height={H} />
            ))
          : <PeLists view={view} />}
      </div>
    </ChartCard>
  );
}

function PeLists({ view }: { view: View }) {
  const { theme } = useThemeStore();
  const apiView = toApiView(view);
  const state = useStat(() => getPe(apiView, 10), [apiView]);
  const palette = chartPalette(theme);
  const options = useMemo(
    () => (state.data ? PANELS.map((p, i) => hBarOption(theme, state.data![p.key] as Item[], palette[i], 100)) : null),
    // palette 는 theme 에서 파생
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.data, theme],
  );
  if (state.loading || state.failed || !state.data) {
    return (
      <div style={{ gridColumn: 'span 3' }}>
        <StatBody state={state} height={H}>{() => null}</StatBody>
      </div>
    );
  }
  return (
    <>
      {PANELS.map((p, i) => (
        <div key={p.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          <span style={{ fontSize: theme.fontSize.sm, fontWeight: 600, color: theme.colors.textMuted }}>{p.title}</span>
          {state.data![p.key].length === 0 ? (
            <ChartState height={H}>해당 기간 데이터가 없습니다</ChartState>
          ) : (
            options && <EChart option={options[i]} height={H} />
          )}
        </div>
      ))}
    </>
  );
}
