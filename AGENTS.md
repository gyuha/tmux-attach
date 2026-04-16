# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the CLI entrypoint and runtime code. `src/index.tsx` boots the Ink UI, `src/components/` holds TUI components such as `App` and `Picker`, and `src/tmux.ts` contains tmux command helpers and session logic. Shared types live in `src/types.ts`.

`tests/` mirrors the runtime layout with `*.test.ts` and `*.test.tsx` files. Use `docs/` for screenshots and other repo documentation assets. `dist/` is generated output from TypeScript; do not edit it by hand.

## Build, Test, and Development Commands

- `npm run build` compiles `src/` into `dist/` with declarations and source maps.
- `npm run dev` runs `tsc --watch` for local iteration.
- `npm test` runs the full Vitest suite once.
- `npm run test:watch` starts Vitest in watch mode.
- `npm run typecheck` runs `tsc --noEmit` for strict type validation.

Use Node.js 20+ and `npm`, not `pnpm` or `yarn`; the repo is locked with `package-lock.json`.

## Coding Style & Naming Conventions

This project uses strict TypeScript with ESM and `NodeNext` resolution. Keep imports in TS files using `.js` suffixes for local modules, for example `import { App } from './components/App.js';`.

Follow existing style: 2-space indentation, single quotes, and small focused modules. Use `PascalCase` for React/Ink components, `camelCase` for functions, and clear filenames such as `SessionItem.tsx` or `tmux.test.ts`.

## Testing Guidelines

Vitest is the test runner and `ink-testing-library` is used for UI behavior. Place tests under `tests/` and name them `*.test.ts` or `*.test.tsx` to match the configured include pattern.

Prefer unit tests around tmux helpers and entrypoint branching, and component tests for rendered terminal output. Run `npm test` before opening a PR; run `npm run typecheck` for any TypeScript change.

## Commit & Pull Request Guidelines

Recent history uses short conventional prefixes such as `feat:`, `docs:`, and `chore:`. Keep commit subjects imperative and concise, for example `feat: add session sorting`.

PRs should include a brief summary, test results, and any tmux or terminal assumptions. For UI changes in the picker, attach a screenshot or short GIF from `docs/` so reviewers can verify terminal behavior quickly.
