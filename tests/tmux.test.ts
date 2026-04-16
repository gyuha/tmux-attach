import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as childProcess from 'node:child_process';
import { getSessions, hasSessions, attachSession, newSession, escapeSessionName, isInsideTmux } from '../src/tmux.js';

vi.mock('node:child_process');

describe('tmux', () => {
  let execSyncMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    execSyncMock = vi.spyOn(childProcess, 'execSync');
    delete process.env.TMUX;
    delete process.env.TERM;
    delete process.env.TERM_PROGRAM;
  });

  afterEach(() => {
    execSyncMock.mockRestore();
    delete process.env.TMUX;
    delete process.env.TERM;
    delete process.env.TERM_PROGRAM;
  });

  describe('isInsideTmux', () => {
    it('returns false when TMUX is unset', () => {
      process.env.TERM = 'tmux-256color';

      expect(isInsideTmux()).toBe(false);
    });

    it('returns false when TMUX leaks into a non-tmux terminal', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,1234,0';
      process.env.TERM = 'xterm-256color';
      process.env.TERM_PROGRAM = 'Antigravity';

      expect(isInsideTmux()).toBe(false);
    });

    it('returns true when TERM indicates a tmux client', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,1234,0';
      process.env.TERM = 'tmux-256color';

      expect(isInsideTmux()).toBe(true);
    });

    it('returns true when TERM_PROGRAM indicates tmux', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,1234,0';
      process.env.TERM = 'xterm-256color';
      process.env.TERM_PROGRAM = 'tmux';

      expect(isInsideTmux()).toBe(true);
    });

    it('returns false for VS Code terminals that inherit tmux env vars', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,1234,0';
      process.env.TERM = 'screen-256color';
      process.env.TERM_PROGRAM = 'vscode';

      expect(isInsideTmux()).toBe(false);
    });
  });

  describe('getSessions', () => {
    it('returns empty array when no sessions exist', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('no sessions');
      });

      const sessions = getSessions();
      expect(sessions).toEqual([]);
    });

    it('parses multiple sessions correctly', () => {
      execSyncMock.mockReturnValue('main:1:3:1700000000\nwork:0:2:1700001000\n');

      const sessions = getSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toEqual({
        name: 'main',
        attached: true,
        windows: 3,
        created: 1700000000,
      });
      expect(sessions[1]).toEqual({
        name: 'work',
        attached: false,
        windows: 2,
        created: 1700001000,
      });
    });
  });

  describe('escapeSessionName', () => {
    it('keeps valid characters unchanged', () => {
      expect(escapeSessionName('my_project-01.test')).toBe('my_project-01.test');
    });

    it('replaces spaces with underscore', () => {
      expect(escapeSessionName('my project')).toBe('my_project');
    });

    it('replaces semicolons and special chars', () => {
      expect(escapeSessionName('test;echo fail')).toBe('test_echo_fail');
    });

    it('throws on empty result after escaping', () => {
      expect(() => escapeSessionName('!!!')).toThrow('Session name cannot be empty');
    });

    it('throws on names starting with dot', () => {
      expect(() => escapeSessionName('.hidden')).toThrow('cannot start with . or -');
    });

    it('throws on names starting with dash', () => {
      expect(() => escapeSessionName('-start')).toThrow('cannot start with . or -');
    });

    it('throws on very long names', () => {
      expect(() => escapeSessionName('a'.repeat(257))).toThrow('maximum 256 characters');
    });
  });

  describe('hasSessions', () => {
    it('returns true when sessions exist', () => {
      execSyncMock.mockReturnValue('main:1:3:1700000000\n');

      expect(hasSessions()).toBe(true);
    });

    it('returns false when no sessions exist', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('no sessions');
      });

      expect(hasSessions()).toBe(false);
    });
  });

  describe('attachSession', () => {
    it('executes tmux attach with escaped session name (outside tmux)', () => {
      delete process.env.TMUX;
      execSyncMock.mockReturnValue('');

      attachSession('work');

      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux attach -t work',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('executes tmux switch-client when inside tmux', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,1234,0';
      process.env.TERM = 'tmux-256color';
      execSyncMock.mockReturnValue('');

      attachSession('work');

      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux switch-client -t work',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('uses tmux attach when TMUX is set by a non-tmux terminal', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,1234,0';
      process.env.TERM = 'xterm-256color';
      process.env.TERM_PROGRAM = 'Antigravity';
      execSyncMock.mockReturnValue('');

      attachSession('work');

      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux attach -t work',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('uses tmux attach for VS Code terminals that inherit tmux env vars', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,1234,0';
      process.env.TERM = 'screen-256color';
      process.env.TERM_PROGRAM = 'vscode';
      execSyncMock.mockReturnValue('');

      attachSession('work');

      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux attach -t work',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('escapes session names with special characters', () => {
      delete process.env.TMUX;
      execSyncMock.mockReturnValue('');

      attachSession('my project; rm -rf /');

      // Should escape the dangerous characters
      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux attach -t my_project__rm_-rf__',
        expect.any(Object)
      );
    });

    it('throws error for invalid session names', () => {
      expect(() => attachSession('')).toThrow('Session name cannot be empty');
      expect(() => attachSession('.hidden')).toThrow('cannot start with . or -');
    });
  });

  describe('newSession', () => {
    it('executes tmux new-session with escaped session name', () => {
      execSyncMock.mockReturnValue('');

      newSession('myproject');

      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux new-session -s myproject',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('escapes session names with special characters', () => {
      execSyncMock.mockReturnValue('');

      newSession('my project');

      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux new-session -s my_project',
        expect.any(Object)
      );
    });

    it('throws error for invalid session names', () => {
      expect(() => newSession('')).toThrow('Session name cannot be empty');
      expect(() => newSession('.hidden')).toThrow('cannot start with . or -');
    });
  });
});
