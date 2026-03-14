#!/usr/bin/env node
import { render } from 'ink';
import { App } from './components/App.js';
import { execSync } from 'node:child_process';
import { hasSessions } from './tmux.js';

if (!hasSessions()) {
  execSync('tmux', { stdio: 'inherit' });
  process.exit(0);
} else {
  render(<App />);
}
