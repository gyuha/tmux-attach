export const TMUX_TIPS = [
  // Sessions
  'Ctrl+b d — Detach from session',
  'Ctrl+b s — Show all sessions',
  'Ctrl+b $ — Rename session',
  'Ctrl+b ( — Move to previous session',
  'Ctrl+b ) — Move to next session',

  // Windows
  'Ctrl+b c — Create window',
  'Ctrl+b , — Rename current window',
  'Ctrl+b & — Close current window',
  'Ctrl+b w — List windows',
  'Ctrl+b p — Previous window',
  'Ctrl+b n — Next window',
  'Ctrl+b l — Toggle last active window',
  'Ctrl+b 0-9 — Switch to window by number',

  // Panes
  'Ctrl+b % — Split vertically',
  'Ctrl+b " — Split horizontally',
  'Ctrl+b o — Switch to next pane',
  'Ctrl+b q — Show pane numbers',
  'Ctrl+b z — Toggle pane zoom',
  'Ctrl+b x — Close current pane',
  'Ctrl+b { — Move current pane left',
  'Ctrl+b } — Move current pane right',
  'Ctrl+b Spacebar — Toggle between pane layouts',
  'Ctrl+b ! — Convert pane into a window',

  // Pane navigation with arrows
  'Ctrl+b ↑/↓/←/→ — Navigate between panes',

  // Copy Mode
  'Ctrl+b [ — Enter copy mode (then use vi keys to navigate)',
  'Ctrl+b PgUp — Enter copy mode and scroll up',
  'q — Quit copy mode',
  'Spacebar — Start selection (in copy mode)',
  'Enter — Copy selection (in copy mode)',
  'Ctrl+b ] — Paste copied contents',

  // Copy Mode navigation (vi-style)
  'h/j/k/l — Move left/down/up/right (vi keys in copy mode)',
  'w — Jump forward one word (copy mode : Ctrl+b [)',
  'b — Jump backward one word (copy mode : Ctrl+b [)',
  'g — Go to top of buffer (copy mode : Ctrl+b [)',
  'G — Go to bottom of buffer (copy mode : Ctrl+b [)',
  '0 — Jump to start of line (copy mode : Ctrl+b [)',
  '^ — Jump to first non-whitespace (copy mode : Ctrl+b [)',
  '$ — Jump to end of line (copy mode : Ctrl+b [)',

  // Search
  '/ — Search forward (copy mode : Ctrl+b [)',
  '? — Search backward (copy mode : Ctrl+b [)',
  'n — Next search match',
  'N — Previous search match',

  // Buffer management
  ':list-buffers — Show all buffers',
  ':choose-buffer — Select buffer to paste',
  'Ctrl+b ] — Paste from buffer_0',

  // Misc
  'Ctrl+b ? — List all shortcuts',
  'Ctrl+b : — Enter command mode',
  ':set mouse on — Enable mouse mode',

  // Commands
  'tmux ls — List all sessions',
  'tmux a — Attach to last session',
  'tmux new -s name — Create named session',
  ':swap-window -t -1 — Move window left',
  ':move-window -r — Renumber windows',
] as const;

export function getRandomTipIndex(length: number): number {
  return Math.floor(Math.random() * length);
}
