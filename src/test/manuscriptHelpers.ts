import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

/** The reading sections turn pages; archive actions now sit below the book. */
export async function manuscriptSpread(
  user: ReturnType<typeof userEvent.setup>,
  spread: 'identity' | 'story' | 'archive',
) {
  const skip = screen.queryByRole('button', { name: /Skip animation/ });
  if (skip) await user.click(skip);
  if (spread === 'archive') {
    await user.click(screen.getByRole('link', { name: /Your archive & sources/ }));
    return;
  }
  await user.click(
    screen.getByRole('button', {
      name: `Open ${spread === 'identity' ? 'introduction' : 'story'} spread`,
    }),
  );
  await waitFor(() =>
    expect(document.querySelector('[data-book-phase]')).toHaveAttribute(
      'data-book-phase',
      'reading',
    ),
  );
}
