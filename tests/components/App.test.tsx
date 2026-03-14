import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { App } from '../../src/components/App.js';

vi.mock('../../src/tmux.js', () => ({
  hasSessions: vi.fn(),
  getSessions: vi.fn(),
  attachSession: vi.fn(),
  newSession: vi.fn(),
}));

describe('App', () => {
  it('shows loading state initially', () => {
    const { lastFrame } = render(<App />);
    expect(lastFrame()).toContain('Loading');
  });
});
