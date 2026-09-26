import type { View } from '../types/stats';
import { VIEWS } from '../utils/view';
import { SegmentedToggle } from './SegmentedToggle';

export function ViewSelector({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return <SegmentedToggle options={VIEWS} value={view} onChange={onChange} ariaLabel="보기" />;
}
