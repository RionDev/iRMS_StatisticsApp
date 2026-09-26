import { useThemeStore } from '@common/stores/themeStore';
import { InflowCard } from '../components/InflowCard';
import { RankCard } from '../components/RankCard';
import { StatsLayout } from '../components/StatsLayout';
import { getLocale, getSource, getTrend } from '../services/statsService';
import { chartPalette } from '../components/EChart';

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' } as const;
const WIDE = { gridColumn: 'span 2' } as const;

export function InflowPage() {
  const { theme } = useThemeStore();
  return (
    <StatsLayout title="유입">
      {(view) => (
        <div style={GRID}>
          <InflowCard view={view} style={WIDE} />
          <RankCard
            title="source 별 유입"
            view={view}
            fetchList={(v) => getSource(v, 20)}
            fetchTrend={() => getTrend('source', { limit: 20 })}
          />
          <RankCard
            title="locale 별 유입"
            view={view}
            fetchList={(v) => getLocale(v, 10)}
            fetchTrend={() => getTrend('locale', { limit: 20 })}
            color={chartPalette(theme)[1]}
            labelWidth={60}
          />
        </div>
      )}
    </StatsLayout>
  );
}
