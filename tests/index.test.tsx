import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

const execSyncMock = vi.fn();
const renderMock = vi.fn();
const hasSessionsMock = vi.fn();
const isInsideTmuxMock = vi.fn();

async function loadEntrypoint() {
  vi.doMock('node:child_process', () => ({
    execSync: execSyncMock,
  }));

  vi.doMock('ink', () => ({
    render: renderMock,
  }));

  vi.doMock('../src/tmux.js', () => ({
    hasSessions: hasSessionsMock,
    isInsideTmux: isInsideTmuxMock,
  }));

  vi.doMock('../src/components/App.js', () => ({
    App: () => null,
  }));

  vi.doMock('../src/components/Picker.js', () => ({
    Picker: () => null,
  }));

  await import('../src/index.tsx');
}

describe('CLI startup', () => {
  beforeEach(() => {
    vi.resetModules();
    execSyncMock.mockReset();
    renderMock.mockReset();
    hasSessionsMock.mockReset();
    isInsideTmuxMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the new-session dialog when no sessions exist', async () => {
    isInsideTmuxMock.mockReturnValue(false);
    hasSessionsMock.mockReturnValue(false);

    await loadEntrypoint();

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(execSyncMock).not.toHaveBeenCalled();
  });

  it('renders the app when sessions exist', async () => {
    isInsideTmuxMock.mockReturnValue(false);
    hasSessionsMock.mockReturnValue(true);

    await loadEntrypoint();

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(execSyncMock).not.toHaveBeenCalled();
  });

  it('prints an error and exits when running inside tmux', async () => {
    isInsideTmuxMock.mockReturnValue(true);
    hasSessionsMock.mockReturnValue(true);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined as never) as typeof process.exit);
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    await loadEntrypoint();

    expect(stderrSpy).toHaveBeenCalledWith('tmux-attach cannot be run from inside tmux.\n');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(execSyncMock).not.toHaveBeenCalled();
    expect(renderMock).not.toHaveBeenCalled();
  });
});
