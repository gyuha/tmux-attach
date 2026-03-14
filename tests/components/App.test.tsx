import { describe, it, expect, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { App } from '../../src/components/App.js';
import { getSessions } from '../../src/tmux.js';

vi.mock('../../src/tmux.js', () => ({
  hasSessions: vi.fn(),
  getSessions: vi.fn(),
  attachSession: vi.fn(),
  newSession: vi.fn(),
  isInsideTmux: vi.fn(() => false),
  getCurrentSessionName: vi.fn(() => null),
}));

describe('App', () => {
  it('shows loading state initially', () => {
    vi.mocked(getSessions).mockReturnValue([]);
    const { lastFrame } = render(<App />);
    expect(lastFrame()).toContain('Loading');
  });
});
