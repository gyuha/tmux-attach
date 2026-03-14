import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'ink-testing-library';
import { Picker } from '../../src/components/Picker.js';

const exitMock = vi.fn();

vi.mock('ink', async () => {
  const actual = await vi.importActual<typeof import('ink')>('ink');

  return {
    ...actual,
    useApp: () => ({ exit: exitMock }),
  };
});

vi.mock('../../src/tmux.js', () => ({
  attachSession: vi.fn(),
  newSession: vi.fn(),
  isInsideTmux: vi.fn(() => false),
  getCurrentSessionName: vi.fn(() => null),
}));

const sessions = [
  { name: 'work', attached: false, windows: 1, created: 1 },
  { name: 'docs', attached: false, windows: 1, created: 2 },
];

const flushEffects = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('Picker', () => {
  beforeEach(() => {
    exitMock.mockClear();
  });

  it('moves down with j and up with k in list mode', async () => {
    const { stdin, lastFrame } = render(<Picker sessions={sessions} />);

    await flushEffects();
    expect(lastFrame()).toContain('› New session');

    stdin.write('j');
    await flushEffects();
    expect(lastFrame()).toContain('› work');

    stdin.write('k');
    await flushEffects();
    expect(lastFrame()).toContain('› New session');
  });

  it('exits the picker when q is pressed in list mode', async () => {
    const { stdin } = render(<Picker sessions={sessions} />);

    await flushEffects();
    stdin.write('q');

    expect(exitMock).toHaveBeenCalledTimes(1);
  });

  it('exits the picker when escape is pressed in list mode', async () => {
    const { stdin } = render(<Picker sessions={sessions} />);

    await flushEffects();
    stdin.write('\u001B');

    expect(exitMock).toHaveBeenCalledTimes(1);
  });
});
