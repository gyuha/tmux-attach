import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as childProcess from 'node:child_process';
import { getSessions, hasSessions, attachSession, newSession, escapeSessionName } from '../src/tmux.js';

vi.mock('node:child_process');

describe('tmux', () => {
  let execSyncMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    execSyncMock = vi.spyOn(childProcess, 'execSync');
  });

  afterEach(() => {
    execSyncMock.mockRestore();
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
});
