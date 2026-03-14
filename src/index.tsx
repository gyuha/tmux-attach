#!/usr/bin/env node
import { render } from 'ink';
import { App } from './components/App.js';
import { execSync } from 'node:child_process';
import { hasSessions, isInsideTmux } from './tmux.js';

if (isInsideTmux()) {
  process.stderr.write('tmux-attach cannot be run from inside tmux.\n');
  process.exit(1);
} else if (!hasSessions()) {
  execSync('tmux', { stdio: 'inherit' });
  process.exit(0);
} else {
  render(<App />);
}
