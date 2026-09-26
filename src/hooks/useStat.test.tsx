// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useStat } from './useStat';

describe('useStat', () => {
  it('늦게 도착한 이전 응답은 버린다', async () => {
    const resolvers: Record<string, (v: string) => void> = {};
    const fetcher = (key: string) => new Promise<string>((resolve) => { resolvers[key] = resolve; });
    const { result, rerender } = renderHook(({ k }) => useStat(() => fetcher(k), [k]), {
      initialProps: { k: 'a' },
    });
    rerender({ k: 'b' });
    await act(async () => { resolvers.b('B'); });
    await act(async () => { resolvers.a('A'); });
    expect(result.current.data).toBe('B');
    expect(result.current.loading).toBe(false);
  });

  it('실패하면 failed, reload 로 다시 부른다', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(42);
    const { result } = renderHook(() => useStat(fetcher, []));
    await waitFor(() => expect(result.current.failed).toBe(true));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toBe(42));
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.current.failed).toBe(false);
  });
});
