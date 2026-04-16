import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  const originalArgv = [...process.argv];

  beforeEach(() => {
    vi.resetModules();
    execSyncMock.mockReset();
    renderMock.mockReset();
    hasSessionsMock.mockReset();
    isInsideTmuxMock.mockReset();
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.argv = [...originalArgv];
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

  it('prints the current version when --version is passed', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      version: string;
    };

    process.argv = ['node', 'tmux-attach', '--version'];
    isInsideTmuxMock.mockReturnValue(true);
    hasSessionsMock.mockReturnValue(true);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined as never) as typeof process.exit);
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    await loadEntrypoint();

    expect(stdoutSpy).toHaveBeenCalledWith(`${packageJson.version}\n`);
    expect(stderrSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(renderMock).not.toHaveBeenCalled();
    expect(execSyncMock).not.toHaveBeenCalled();
  });
});
