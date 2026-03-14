#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './components/App.js';
import { execSync } from 'node:child_process';

// Handle direct mode exit (when no sessions exist)
process.on('exit', (code) => {
  if (code === 0) {
    // App determined no sessions, exec tmux directly
    process.stdout.write('\x1b[?1049l'); // Exit alternate screen
    execSync('tmux', { stdio: 'inherit' });
  }
});

render(<App />);
