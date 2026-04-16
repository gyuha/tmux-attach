# Changelog

All notable changes to this project will be documented in this file.

## 0.1.6 - 2026-04-16

- Added a `--version` CLI flag that prints the packaged version without entering the TUI flow.
- Added entrypoint coverage for the version path to keep release metadata behavior tested.
- Bumped package metadata for the 0.1.6 release.

## 0.1.5 - 2026-04-16

- Refined tmux client detection so the CLI only blocks active tmux clients and still works in IDE terminals that inherit tmux-related environment variables.
- Added rotating tmux usage tips to the session picker to make the TUI more informative while navigating.
- Refreshed the README with a demo screenshot and clearer runtime guidance for tmux-backed terminals.
- Synchronized package metadata for the deployment release.
