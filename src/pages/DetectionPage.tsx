import { useThemeStore } from '@common/stores/themeStore';
import { DiagCard } from '../components/DiagCard';
import { chartPalette } from '../components/EChart';
import { RankCard } from '../components/RankCard';
import { RatioCard } from '../components/RatioCard';
import { StatsLayout } from '../components/StatsLayout';
import { TagCard } from '../components/TagCard';
import { VendorDetectionCard } from '../components/VendorDetectionCard';
import { getLabel, getTrend } from '../services/statsService';

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' } as const;
const WIDE = { gridColumn: 'span 2' } as const;

export function DetectionPage() {
  const { theme } = useThemeStore();
  return (
    <StatsLayout title="진단">
      {(view) => (
        <div style={GRID}>
          <DiagCard view={view} style={WIDE} />
          <VendorDetectionCard view={view} />
          <RatioCard view={view} />
          <RankCard
            title="label 별"
            view={view}
            fetchList={(v) => getLabel(v, 15)}
            fetchTrend={() => getTrend('label', { limit: 20 })}
            color={chartPalette(theme)[2]}
            height={400}
          />
          <TagCard view={view} />
        </div>
      )}
    </StatsLayout>
  );
}
