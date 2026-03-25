#!/usr/bin/env node
import { render } from 'ink';
import { App } from './components/App.js';
import { Picker } from './components/Picker.js';
import { hasSessions, isInsideTmux } from './tmux.js';

if (isInsideTmux()) {
  process.stderr.write('tmux-attach cannot be run from inside tmux.\n');
  process.exit(1);
} else if (!hasSessions()) {
  render(<Picker sessions={[]} initialMode="input" />);
} else {
  render(<App />);
}
