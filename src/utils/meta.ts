import type { MetaStats } from '../types/stats';

/** 실패가 해당 job 의 마지막 성공보다 최신인지 — /meta 의 last_failed 는 역대 최신 실패라 그대로 두면 안 사라진다 */
export function isActiveFailure(meta: MetaStats): boolean {
  const failed = meta.last_failed;
  if (!failed) return false;
  const lastOk = failed.job === 'hourly' ? meta.hourly_last_ok : meta.daily_last_ok;
  if (lastOk == null || failed.finished_at == null) return true;
  return Date.parse(failed.finished_at) > Date.parse(lastOk);
}
