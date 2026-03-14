import { execSync } from 'node:child_process';
import type { TmuxSession } from './types.js';

export function getSessions(): TmuxSession[] {
  try {
    const output = execSync('tmux list-sessions -F "#{session_name}:#{session_attached}:#{session_windows}:#{session_created}" 2>/dev/null', {
      encoding: 'utf-8',
    }).trim();

    if (!output) {
      return [];
    }

    return output.split('\n').map((line) => {
      const [name, attached, windows, created] = line.split(':');
      return {
        name,
        attached: attached === '1',
        windows: parseInt(windows, 10),
        created: parseInt(created, 10),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Escape and validate a session name to prevent command injection.
 * tmux session names should only contain alphanumeric, dash, underscore, and dot.
 * @throws Error if the name is invalid (empty, starts with . or -, too long)
 */
export function escapeSessionName(name: string): string {
  // Remove any characters that could be used for command injection
  // tmux session names: alphanumeric, dash, underscore, dot
  const escaped = name.replace(/[^a-zA-Z0-9_.-]/g, '_');

  // Check if the name becomes empty or contains no valid alphanumeric characters
  if (!escaped || !/[a-zA-Z0-9]/.test(escaped)) {
    throw new Error('Session name cannot be empty');
  }

  if (escaped.startsWith('.') || escaped.startsWith('-')) {
    throw new Error(`Invalid session name: "${name}" (cannot start with . or -)`);
  }

  if (escaped.length > 256) {
    throw new Error('Session name too long: maximum 256 characters');
  }

  return escaped;
}

export function hasSessions(): boolean {
  return getSessions().length > 0;
}
