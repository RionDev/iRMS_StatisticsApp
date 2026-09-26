import { useState } from 'react';
import type { CSSProperties } from 'react';
import { getTag, getTrend } from '../services/statsService';
import type { TagGroup, View } from '../types/stats';
import { RankCard } from './RankCard';
import { SegmentedToggle } from './SegmentedToggle';

const LIMIT = 20;

/** 12 tag 별 — dict_sample_tag.name 이 cve- 로 시작하면 CVE 그룹 */
export function TagCard({ view, style }: { view: View; style?: CSSProperties }) {
  const [group, setGroup] = useState<TagGroup>('general');
  return (
    <RankCard
      title="tag 별"
      view={view}
      fetchList={(v) => getTag(v, group, LIMIT)}
      fetchTrend={() => getTrend('tag', { group, limit: LIMIT })}
      deps={[group]}
      controls={
        <SegmentedToggle<TagGroup>
          options={[
            { value: 'general', label: '일반' },
            { value: 'cve', label: 'CVE' },
          ]}
          value={group}
          onChange={setGroup}
          ariaLabel="태그 그룹"
        />
      }
      labelWidth={160}
      height={400}
      style={style}
    />
  );
}
