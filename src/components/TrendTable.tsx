import { useState } from 'react';
import { useThemeStore } from '@common/stores/themeStore';
import { useStat } from '../hooks/useStat';
import type { TrendItem, TrendStats } from '../types/stats';
import { formatCount, formatGrowth } from '../utils/format';
import { SegmentedToggle } from './SegmentedToggle';
import { StatBody } from './StatBody';

/** 급상승/신규 등장 표 — 순위 · 이름 · 전주 → 이번 주 · 증가율 */
export function TrendTable({ items }: { items: TrendItem[] }) {
  const { theme } = useThemeStore();
  if (items.length === 0) {
    return <div style={{ padding: '24px 0', textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.fontSize.base }}>항목이 없습니다</div>;
  }
  const cell = { padding: '6px 8px', borderBottom: `1px solid ${theme.colors.border}`, fontSize: theme.fontSize.sm } as const;
  const head = { ...cell, color: theme.colors.textMuted, fontWeight: 600, textAlign: 'left' as const };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.colors.text }}>
      <thead>
        <tr>
          <th style={{ ...head, width: '48px' }}>순위</th>
          <th style={head}>이름</th>
          <th style={{ ...head, textAlign: 'right' }}>전주 → 이번 주</th>
          <th style={{ ...head, textAlign: 'right', width: '80px' }}>증가율</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.id}>
            <td style={{ ...cell, color: theme.colors.textMuted }}>{it.rank}</td>
            <td style={{ ...cell, maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.name}>
              {it.name}
            </td>
            <td style={{ ...cell, textAlign: 'right' }}>{`${formatCount(it.prev_count)} → ${formatCount(it.cur_count)}`}</td>
            <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: it.growth_pct == null ? theme.colors.primary : theme.colors.danger }}>
              {formatGrowth(it.growth_pct)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface TrendPanelProps {
  fetchTrend: () => Promise<TrendStats>;
  deps: unknown[];
  height: number;
  /** 한 카드에 여러 패널이 있을 때 작은 제목 */
  title?: string;
}

type Tab = 'rising' | 'new';

/** 급상승 모드 본문 — 미집계 문구 + [급상승 | 신규 등장] 탭 + 표 */
export function TrendPanel({ fetchTrend, deps, height, title }: TrendPanelProps) {
  const { theme } = useThemeStore();
  const state = useStat(fetchTrend, deps);
  const [tab, setTab] = useState<Tab>('rising');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
      {title && <span style={{ fontSize: theme.fontSize.sm, fontWeight: 600, color: theme.colors.textMuted }}>{title}</span>}
      <StatBody state={state} height={height} isEmpty={(d) => d.computed_date === null} emptyText="급상승은 일일 집계 후 표시됩니다">
        {(d) => (
          <>
            <SegmentedToggle<Tab>
              options={[
                { value: 'rising', label: `급상승 ${d.rising.length}` },
                { value: 'new', label: `신규 등장 ${d.new.length}` },
              ]}
              value={tab}
              onChange={setTab}
              ariaLabel="급상승 구분"
            />
            <div style={{ maxHeight: `${height}px`, overflowY: 'auto' }}>
              <TrendTable items={tab === 'rising' ? d.rising : d.new} />
            </div>
          </>
        )}
      </StatBody>
    </div>
  );
}
