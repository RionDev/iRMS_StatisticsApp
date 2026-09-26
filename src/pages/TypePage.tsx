import { useThemeStore } from '@common/stores/themeStore';
import { chartPalette } from '../components/EChart';
import { FormatDrillCard } from '../components/FormatDrillCard';
import { PeCard } from '../components/PeCard';
import { RankCard } from '../components/RankCard';
import { SizeCard } from '../components/SizeCard';
import { StatsLayout } from '../components/StatsLayout';
import { getCompiler, getLibrary, getTrend } from '../services/statsService';

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' } as const;
const WIDE = { gridColumn: 'span 2' } as const;

export function TypePage() {
  const { theme } = useThemeStore();
  const palette = chartPalette(theme);
  return (
    <StatsLayout title="파일 타입">
      {(view) => (
        <div style={GRID}>
          <FormatDrillCard view={view} style={WIDE} />
          <PeCard view={view} style={WIDE} />
          <RankCard
            title="file_compiler 별"
            view={view}
            fetchList={(v) => getCompiler(v, 10)}
            fetchTrend={() => getTrend('compiler', { limit: 20 })}
            color={palette[2]}
          />
          <RankCard
            title="file_library 별"
            view={view}
            fetchList={(v) => getLibrary(v, 10)}
            fetchTrend={() => getTrend('library', { limit: 20 })}
            color={palette[3]}
          />
          <SizeCard view={view} />
        </div>
      )}
    </StatsLayout>
  );
}
