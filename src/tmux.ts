import { execSync } from 'node:child_process';
import type { TmuxSession } from './types.js';

/**
 * Check if we're currently inside a tmux session.
 */
export function isInsideTmux(): boolean {
  return !!process.env.TMUX;
}

/**
 * Get the current tmux session name if inside tmux.
 */
export function getCurrentSessionName(): string | null {
  if (!isInsideTmux()) {
    return null;
  }
  try {
    return execSync('tmux display-message -p "#{session_name}"', {
      encoding: 'utf-8',
    }).trim();
  } catch {
    return null;
  }
}

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

export function getDefaultSessionName(cwd = process.cwd()): string {
  const trimmedPath = cwd.replace(/\/+$/, '');
  return trimmedPath.split('/').pop() || 'session';
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

export function attachSession(sessionName: string): void {
  const escapedName = escapeSessionName(sessionName);
  if (isInsideTmux()) {
    // Inside tmux: use switch-client to switch to another session
    execSync(`tmux switch-client -t ${escapedName}`, {
      stdio: 'inherit',
    });
  } else {
    // Outside tmux: use attach
    execSync(`tmux attach -t ${escapedName}`, {
      stdio: 'inherit',
    });
  }
}

export function newSession(sessionName: string): void {
  const escapedName = escapeSessionName(sessionName);
  execSync(`tmux new-session -s ${escapedName}`, {
    stdio: 'inherit',
  });
}

export function hasSessions(): boolean {
  return getSessions().length > 0;
}
