#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { render } from 'ink';
import { App } from './components/App.js';
import { Picker } from './components/Picker.js';
import { hasSessions, isInsideTmux } from './tmux.js';

function getVersion() {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    version: string;
  };

  return packageJson.version;
}

if (process.argv.includes('--version')) {
  process.stdout.write(`${getVersion()}\n`);
} else if (isInsideTmux()) {
  process.stderr.write('tmux-attach cannot be run from inside tmux.\n');
  process.exit(1);
} else if (!hasSessions()) {
  render(<Picker sessions={[]} initialMode="input" />);
} else {
  render(<App />);
}
