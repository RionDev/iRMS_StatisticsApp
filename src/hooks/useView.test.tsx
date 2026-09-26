// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ViewSelector } from '../components/ViewSelector';
import { useView } from './useView';

function Probe() {
  const [view, setView] = useView();
  const location = useLocation();
  return (
    <>
      <ViewSelector view={view} onChange={setView} />
      <span data-testid="search">{location.search}</span>
    </>
  );
}

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Probe />
    </MemoryRouter>,
  );

describe('useView + ViewSelector', () => {
  it('잘못된 ?view= 는 week 로 고친다', async () => {
    renderAt('/inflow?view=bogus');
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?view=week'));
  });
  it('?view= 가 없으면 week', async () => {
    renderAt('/inflow');
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?view=week'));
    expect(screen.getByRole('button', { name: '주간' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('버튼을 누르면 ?view= 가 바뀐다', async () => {
    renderAt('/inflow?view=week');
    fireEvent.click(screen.getByRole('button', { name: '급상승' }));
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?view=rising'));
    expect(screen.getByRole('button', { name: '급상승' })).toHaveAttribute('aria-pressed', 'true');
  });
});
