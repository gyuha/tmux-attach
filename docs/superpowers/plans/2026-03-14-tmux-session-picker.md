# tmux Session Picker Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI tool that helps users quickly choose and enter the correct tmux session, skipping UI when no sessions exist and showing a clean fullscreen picker when sessions are present.

**Architecture:** Node.js CLI using Ink (React for terminals) for the UI. Two execution modes: direct mode (no sessions → launch tmux immediately) and picker mode (sessions exist → show fullscreen picker with "New session" first). Uses child processes to interact with tmux commands.

**Tech Stack:** Node.js 20+, TypeScript, Ink (React for CLI), Vitest for testing, npm for distribution

---

## File Structure

```
tmux-attach/
├── package.json              # npm config, dependencies, bin entry
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Test runner configuration
├── src/
│   ├── index.ts              # CLI entry point, mode detection
│   ├── tmux.ts               # tmux session detection and management
│   ├── components/
│   │   ├── App.tsx           # Main app component (mode router)
│   │   ├── Picker.tsx        # Fullscreen session picker
│   │   ├── SessionItem.tsx   # Individual session row
│   │   └── NewSessionInput.tsx # New session name input
│   └── types.ts              # TypeScript interfaces
├── tests/
│   ├── tmux.test.ts          # Unit tests for tmux module
│   └── components/
│       └── App.test.tsx      # Component tests
└── README.md                 # Installation and usage docs
```

---

## Chunk 1: Project Setup and Core tmux Module

### Task 1: Initialize Project Structure

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/types.ts`
- Create: `tests/` directory
- Create: `.npmignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "tmux-attach",
  "version": "0.1.0",
  "description": "A CLI to quickly choose and enter tmux sessions",
  "type": "module",
  "bin": {
    "tmux-attach": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "tmux",
    "cli",
    "session",
    "picker"
  ],
  "author": "gyuha",
  "license": "MIT",
  "engines": {
    "node": ">=20"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  },
  "dependencies": {
    "ink": "^5.0.0",
    "react": "^19.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts', '**/*.test.tsx', 'dist/']
    }
  },
});
```

- [ ] **Step 4: Create src/types.ts**

```typescript
export interface TmuxSession {
  name: string;
  attached: boolean;
  windows: number;
  created: number;
}

export type PickerMode = 'new' | 'list';

export interface AppState {
  sessions: TmuxSession[];
  selectedIndex: number;
  mode: PickerMode;
  newSessionName: string;
  isLoading: boolean;
  error: string | null;
}
```

- [ ] **Step 5: Create tests directory and placeholder**

Run: `mkdir -p tests/components && touch tests/.gitkeep`
Expected: tests directory created

- [ ] **Step 6: Create .npmignore**

```
src/
tests/
*.ts
!*.d.ts
tsconfig.json
vitest.config.ts
.omc/
docs/
.git/
node_modules/
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: Dependencies installed successfully, node_modules created

- [ ] **Step 8: Commit project setup**

```bash
git add package.json tsconfig.json vitest.config.ts src/types.ts tests/.gitkeep .npmignore
git commit -m "chore: initialize project structure with TypeScript and Vitest"
```

---

### Task 2: Implement tmux Session Detection

**Files:**
- Create: `src/tmux.ts`
- Create: `tests/tmux.test.ts`

- [ ] **Step 1: Write failing test for getSessions (empty case)**

Create `tests/tmux.test.ts`:

```typescript
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: Test fails because `getSessions` doesn't exist yet

- [ ] **Step 3: Write minimal implementation for getSessions**

Create `src/tmux.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: Test passes

- [ ] **Step 5: Write test for getSessions with multiple sessions**

Add to `tests/tmux.test.ts`:

```typescript
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 7: Write tests for escapeSessionName**

Add to `tests/tmux.test.ts`:

```typescript
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
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npm test`
Expected: Test fails because `escapeSessionName` doesn't exist

- [ ] **Step 9: Implement escapeSessionName**

Add to `src/tmux.ts`:

```typescript
/**
 * Escape and validate a session name to prevent command injection.
 * tmux session names should only contain alphanumeric, dash, underscore, and dot.
 * @throws Error if the name is invalid (empty, starts with . or -, too long)
 */
export function escapeSessionName(name: string): string {
  // Remove any characters that could be used for command injection
  // tmux session names: alphanumeric, dash, underscore, dot
  const escaped = name.replace(/[^a-zA-Z0-9_.-]/g, '_');

  // Validate the result
  if (!escaped) {
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
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 11: Write test for hasSessions**

Add to `tests/tmux.test.ts`:

```typescript
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
```

- [ ] **Step 12: Run test to verify it fails**

Run: `npm test`
Expected: Test fails because `hasSessions` doesn't exist

- [ ] **Step 13: Implement hasSessions**

Add to `src/tmux.ts`:

```typescript
export function hasSessions(): boolean {
  return getSessions().length > 0;
}
```

- [ ] **Step 14: Run test to verify it passes**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 15: Commit tmux detection module**

```bash
git add src/tmux.ts tests/tmux.test.ts
git commit -m "feat: add tmux session detection with getSessions and hasSessions"
```

---

### Task 3: Implement tmux Session Actions

**Files:**
- Modify: `src/tmux.ts`
- Modify: `tests/tmux.test.ts`

- [ ] **Step 1: Write test for attachSession**

Add to `tests/tmux.test.ts`:

```typescript
  describe('attachSession', () => {
    it('executes tmux attach with escaped session name', () => {
      execSyncMock.mockReturnValue('');

      attachSession('work');

      expect(execSyncMock).toHaveBeenCalledWith(
        'tmux attach -t work',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('escapes session names with special characters', () => {
      execSyncMock.mockReturnValue('');

      attachSession('my project; rm -rf /');

      // Should escape the dangerous characters
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.stringContaining('my_project__rm_-rf__/'),
        expect.any(Object)
      );
    });

    it('throws error for invalid session names', () => {
      expect(() => attachSession('')).toThrow('Session name cannot be empty');
      expect(() => attachSession('.hidden')).toThrow('cannot start with . or -');
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: Test fails because `attachSession` doesn't exist

- [ ] **Step 3: Implement attachSession**

Add to `src/tmux.ts`:

```typescript
export function attachSession(sessionName: string): void {
  const escapedName = escapeSessionName(sessionName);
  execSync(`tmux attach -t ${escapedName}`, {
    stdio: 'inherit',
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: Test passes

- [ ] **Step 5: Write test for newSession**

Add to `tests/tmux.test.ts`:

```typescript
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
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: Test fails because `newSession` doesn't exist

- [ ] **Step 7: Implement newSession**

Add to `src/tmux.ts`:

```typescript
export function newSession(sessionName: string): void {
  const escapedName = escapeSessionName(sessionName);
  execSync(`tmux new-session -s ${escapedName}`, {
    stdio: 'inherit',
  });
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 9: Commit session actions**

```bash
git add src/tmux.ts tests/tmux.test.ts
git commit -m "feat: add attachSession and newSession with command injection protection"
```

---

## Chunk 2: Ink Components

### Task 4: Implement Main App Component

**Files:**
- Create: `src/components/App.tsx`
- Create: `tests/components/App.test.tsx`

- [ ] **Step 1: Write failing test for App component (direct mode)**

Create `tests/components/App.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from 'ink/testing.js';
import { App } from '../../src/components/App.js';

vi.mock('../../src/tmux.js', () => ({
  hasSessions: vi.fn(),
  getSessions: vi.fn(),
  attachSession: vi.fn(),
  newSession: vi.fn(),
}));

describe('App', () => {
  it('shows loading state initially', async () => {
    const { lastFrame } = render(<App />);
    expect(lastFrame()).toContain('Loading');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: Test fails because App component doesn't exist

- [ ] **Step 3: Create minimal App component**

Create `src/components/App.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { hasSessions, getSessions } from '../tmux.js';
import type { TmuxSession } from '../types.js';
import { Picker } from './Picker.js';

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<TmuxSession[]>([]);

  useEffect(() => {
    function checkSessions() {
      const hasAny = hasSessions();
      if (!hasAny) {
        // Direct mode: no sessions, launch tmux immediately
        process.exit(0);
      }

      const sessionList = getSessions();
      setSessions(sessionList);
      setIsLoading(false);
    }

    checkSessions();
  }, []);

  if (isLoading) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return <Picker sessions={sessions} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: Test passes

- [ ] **Step 5: Commit App component**

```bash
git add src/components/App.tsx tests/components/App.test.tsx
git commit -m "feat: add App component with loading state and session check"
```

---

### Task 5: Implement Picker Component

**Files:**
- Create: `src/components/Picker.tsx`
- Create: `src/components/SessionItem.tsx`

- [ ] **Step 1: Create SessionItem component**

Create `src/components/SessionItem.tsx`:

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import type { TmuxSession } from '../types.js';

interface SessionItemProps {
  session: TmuxSession | null; // null for "New session"
  isSelected: boolean;
}

export function SessionItem({ session, isSelected }: SessionItemProps) {
  const prefix = isSelected ? '› ' : '  ';
  const highlight = isSelected ? { color: 'cyan' as const, bold: true } : {};

  if (session === null) {
    return (
      <Box>
        <Text {...highlight}>{prefix}New session</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text {...highlight}>
        {prefix}{session.name}
        {session.attached && <Text color="green"> (attached)</Text>}
      </Text>
    </Box>
  );
}
```

- [ ] **Step 2: Create Picker component**

Create `src/components/Picker.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import type { TmuxSession } from '../types.js';
import { SessionItem } from './SessionItem.js';
import { NewSessionInput } from './NewSessionInput.js';
import { attachSession, newSession } from '../tmux.js';

interface PickerProps {
  sessions: TmuxSession[];
}

export function Picker({ sessions }: PickerProps) {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'list' | 'input'>('list');
  const [newSessionName, setNewSessionName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Total items: "New session" + existing sessions
  const totalItems = 1 + sessions.length;

  useEffect(() => {
    // Prefill new session name with current directory
    const cwd = process.cwd();
    const dirName = cwd.split('/').pop() || 'session';
    setNewSessionName(dirName);
  }, []);

  useInput((input, key) => {
    if (mode === 'input') {
      if (key.escape) {
        setMode('list');
        return;
      }
      if (key.return) {
        handleCreateSession();
        return;
      }
      if (key.backspace || key.delete) {
        setNewSessionName((prev) => prev.slice(0, -1));
        return;
      }
      if (!key.ctrl && !key.meta) {
        setNewSessionName((prev) => prev + input);
      }
      return;
    }

    // List mode navigation
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (key.return) {
      handleSelect(selectedIndex);
    } else if (key.escape || input === 'q') {
      exit();
    }
  });

  function handleSelect(index: number) {
    if (index === 0) {
      // New session selected
      setMode('input');
    } else {
      // Existing session selected
      const session = sessions[index - 1];
      try {
        attachSession(session.name);
        exit();
      } catch (err) {
        setError(`Failed to attach to session: ${err}`);
      }
    }
  }

  function handleCreateSession() {
    if (!newSessionName.trim()) {
      setError('Session name cannot be empty');
      return;
    }
    try {
      newSession(newSessionName.trim());
      exit();
    } catch (err) {
      setError(`Failed to create session: ${err}`);
    }
  }

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      padding={2}
    >
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">
          tmux sessions
        </Text>
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
        {mode === 'list' ? (
          <>
            {/* New session option */}
            <SessionItem session={null} isSelected={selectedIndex === 0} />

            {/* Existing sessions */}
            {sessions.map((session, index) => (
              <SessionItem
                key={session.name}
                session={session}
                isSelected={selectedIndex === index + 1}
              />
            ))}
          </>
        ) : (
          <NewSessionInput
            value={newSessionName}
            error={error}
          />
        )}
      </Box>

      {error && (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>
          {mode === 'list'
            ? '↑/↓ navigate · Enter select · Esc quit'
            : 'Enter confirm · Esc cancel'}
        </Text>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 3: Create NewSessionInput component**

Create `src/components/NewSessionInput.tsx`:

```typescript
import React from 'react';
import { Box, Text } from 'ink';

interface NewSessionInputProps {
  value: string;
  error: string | null;
}

export function NewSessionInput({ value, error }: NewSessionInputProps) {
  return (
    <Box flexDirection="column">
      <Text bold>New session name:</Text>
      <Box marginTop={1}>
        <Text color="cyan">{value}</Text>
        <Text backgroundColor="cyan"> </Text>
      </Box>
      {error && (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
}
```

- [ ] **Step 4: Commit Picker components**

```bash
git add src/components/Picker.tsx src/components/SessionItem.tsx src/components/NewSessionInput.tsx
git commit -m "feat: add Picker, SessionItem, and NewSessionInput components"
```

---

## Chunk 3: CLI Entry Point and Finalization

### Task 6: Create CLI Entry Point

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Create CLI entry point**

Create `src/index.ts`:

```typescript
#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './components/App.js';

// Handle direct mode exit (when no sessions exist)
process.on('exit', (code) => {
  if (code === 0) {
    // App determined no sessions, exec tmux directly
    process.stdout.write('\x1b[?1049l'); // Exit alternate screen
    const { execSync } = require('node:child_process');
    execSync('tmux', { stdio: 'inherit' });
  }
});

render(<App />);
```

- [ ] **Step 2: Build the project**

Run: `npm run build`
Expected: TypeScript compiles successfully, dist/ folder created

- [ ] **Step 3: Test CLI manually**

Run: `node dist/index.js`
Expected: Shows picker if sessions exist, launches tmux directly if not

- [ ] **Step 4: Commit CLI entry point**

```bash
git add src/index.ts
git commit -m "feat: add CLI entry point with direct mode support"
```

---

### Task 7: Update README with Installation and Usage

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README.md**

```markdown
# tmux-attach

A CLI tool that helps you quickly choose and enter tmux sessions.

## Features

- **Smart mode detection**: No sessions? Launches tmux directly. Sessions exist? Shows a clean picker.
- **Fast session creation**: "New session" is always first, with the name prefilled from your current directory.
- **Clean TUI**: Centered, spacious fullscreen picker optimized for quick decisions.

## Installation

```bash
npm install -g tmux-attach
```

Or try it once with npx:

```bash
npx tmux-attach
```

## Usage

Just run:

```bash
tmux-attach
```

### Keyboard Navigation

- `↑/↓` - Navigate between options
- `Enter` - Select highlighted option
- `Esc` or `q` - Exit without attaching

### Creating a New Session

1. Select "New session" (it's always first)
2. Edit the prefilled name (defaults to current directory name)
3. Press `Enter` to create

## Requirements

- Node.js 20+
- tmux installed
- ANSI-compatible terminal

## License

MIT
```

- [ ] **Step 2: Commit README**

```bash
git add README.md
git commit -m "docs: add installation and usage documentation"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: Run TypeScript type check**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 3: Build production bundle**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Verify CLI binary works**

Run: `node dist/index.js --help || echo "CLI runs"`
Expected: CLI executes without crashing

---

## Summary

This plan implements the Phase 1 MVP as specified in the PRD:

1. ✅ Project scaffolded with TypeScript + Ink + Vitest
2. ✅ tmux session detection with `getSessions()` and `hasSessions()`
3. ✅ Direct mode: skips picker when no sessions exist
4. ✅ Picker mode: fullscreen centered UI with "New session" first
5. ✅ New session name input with current directory prefill
6. ✅ npm installation documented in README

**Time estimate:** ~2-3 hours for complete implementation

**Dependencies:** Node.js 20+, tmux installed on system
