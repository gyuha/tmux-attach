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

This installs both `tmux-attach` and the shorter `ta` alias.

Or try it once with `npx`:

```bash
npx tmux-attach
```

## Usage

Just run:

```bash
tmux-attach
```

Or use the short alias:

```bash
ta
```

### Keyboard Navigation

- `↑/↓` or `j/k` - Navigate between options
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
