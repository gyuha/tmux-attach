# Product Requirements Document: tmux Session Picker

**Author**: gyuha
**Date**: 2026-03-14
**Status**: Draft
**Stakeholders**: Product owner, engineering

### 1. Executive Summary

This product adds a small CLI that sits in front of `tmux` and helps users choose the right next action before they attach. If no tmux sessions exist, the CLI should get out of the way and start tmux immediately. If sessions do exist, it should show a clean fullscreen picker with `New session` first and existing sessions below it.

### 2. Background & Context

Today, a user needs to remember and type raw tmux commands to decide whether to resume an existing session or start a new one. That is fast for experienced tmux users, but it is still a point of friction at the exact moment when the user just wants to get into the right working context.

The product should be framed as a **tmux session navigator**, not a broad terminal launcher and not a tmux onboarding product. The core value is simple: help someone enter the intended tmux session faster and with less uncertainty.

Current project context:

- The repository is new and currently contains only `README.md` and a visual reference image.
- The agreed runtime is `Node.js + Ink`.
- The initial distribution target is `npm`, with an easy install story as a product requirement.
- Ink implies a Node runtime dependency; Phase 1 should assume a documented minimum Node version and ANSI-compatible terminals.
- The current visual direction is a centered, spacious, fullscreen TUI rather than a dense power-user list.

Why now:

- The repository is empty, so the product can be scoped tightly around the core decision flow without legacy constraints.
- The chosen runtime makes it practical to build a polished terminal UI quickly and ship it as an npm CLI.

### 3. Objectives & Success Metrics

**Goals**

1. Let users enter the correct tmux session quickly from a single command.
2. Make the empty-state experience feel instant by skipping the picker when no sessions exist.
3. Make creating a new session feel low-friction by putting `New session` first and prefilling the name from the current directory.

**Non-Goals**

1. Teaching tmux concepts or acting as a tmux onboarding flow.
2. Managing panes, windows, layouts, or other advanced tmux features.
3. Adding project/workspace metadata beyond the current directory name prefill.
4. Supporting deep customization, themes, or plugin architecture in Phase 1.
5. Replacing tmux itself or hiding all tmux concepts from users.

**Success Metrics**

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Time to enter intended tmux session in manual test | Not measured | <= 5 seconds for common flows | Timed usability runs across resume-existing and create-new tasks |
| Task completion rate for core flows | Not measured | >= 90% of test runs complete without assistance | Manual acceptance testing on the three core flows |
| Empty-state behavior correctness | Not measured | 100% of test runs skip picker and launch tmux when no sessions exist | Scripted local verification |
| New session naming confidence | Not measured | >= 80% of test users keep or lightly edit the suggested name | Manual usability observation during create-new flow |
| Installation success via npm on a clean machine | Not measured | 100% across supported test environments | Fresh install verification using documented npm flow |

### 4. Target Users & Segments

Primary users:

- CLI users who already intend to use tmux and want a faster way to resume work.
- tmux-curious users who are comfortable in the terminal but do not want to memorize attach and create commands.

Not the primary target in Phase 1:

- Users who need tmux training or explanations.
- Heavy tmux power users who expect advanced filtering, scripting, and full session management.

User jobs:

- "Get me back into the session I was using."
- "Let me start a new session without typing tmux commands from memory."
- "Do the obvious thing when there are no sessions, without showing extra UI."

### 5. User Stories & Requirements

**P0 — Must Have**

| # | User Story | Acceptance Criteria |
|---|-----------|-------------------|
| 1 | As a user with no tmux sessions, I want the CLI to start tmux immediately so I do not see unnecessary UI. | When the CLI detects no sessions or no running tmux server, it launches tmux directly without showing the picker. |
| 2 | As a user with existing tmux sessions, I want to see a clear picker so I can choose the correct session quickly. | The CLI opens a fullscreen centered picker; the first row is `New session`; existing sessions appear below it in a stable order. |
| 3 | As a user selecting an existing session, I want to enter that session with one confirm action. | Confirming a listed session activates the target session and exits the picker cleanly. |
| 4 | As a user creating a new session, I want the CLI to suggest a sensible session name so creation feels fast. | Selecting `New session` opens a name input; the default value is the current directory name when available. |
| 5 | As a user installing the tool, I want the setup to be easy so I can start using it quickly. | The README includes an npm-first install command and a basic usage example; the CLI runs after installation using a single command. |

**P1 — Should Have**

| # | User Story | Acceptance Criteria |
|---|-----------|-------------------|
| 1 | As a user already inside tmux, I want the tool to switch sessions correctly instead of attaching in a broken way. | When run inside tmux, selecting a session uses the appropriate tmux client-switch behavior. |
| 2 | As a user scanning the list, I want light metadata so I can distinguish active sessions. | The picker can show basic attached-state or similar status without cluttering the layout. |
| 3 | As a user who mistypes or changes my mind, I want simple keyboard navigation so I can recover easily. | Up/down movement, confirm, cancel, and text editing in the new-session input work reliably. |

**P2 — Nice to Have / Future**

| # | User Story | Acceptance Criteria |
|---|-----------|-------------------|
| 1 | As a user with many sessions, I want search or filter so I can find the right session faster. | A future version supports incremental filtering without degrading the simple default flow. |
| 2 | As a user with custom habits, I want configurable defaults so the tool matches my workflow. | Future versions may support custom name templates, sorting, or startup behaviors. |
| 3 | As a user installing from other package managers, I want more install paths. | Future versions may add Homebrew or prebuilt binary distribution. |

### 6. Solution Overview

The product is a small npm-installed CLI that runs before the user enters tmux. It has two modes.

1. **Direct mode**: If there are no tmux sessions, the tool launches tmux immediately.
2. **Picker mode**: If sessions exist, the tool opens a fullscreen terminal UI with a centered panel. The first row is `New session`. The remaining rows list existing sessions.

Key product decisions:

- The picker is optimized for the pre-attach decision, not for full session management.
- `New session` is always first so the create path is obvious and reachable with one gesture.
- The create flow uses a prefixed default session name from the current directory to reduce typing.
- The visual design should feel calm and legible, with generous spacing and a clear selection state.
- npm is the initial distribution channel so setup is one command for users already in the Node ecosystem.
- The Phase 1 release should document Node 20+ as the supported baseline and position modern ANSI-compatible terminals as the supported environment.

Assumptions to validate:

- Users will see clear value in the picker when they have more than one tmux session.
- Current-directory name is usually a helpful default for new sessions.
- npm-first distribution is acceptable for the intended early users.
- The tool feels faster than typing raw tmux commands in the common cases.

### 7. Open Questions

| Question | Owner | Deadline |
|----------|-------|----------|
| Is the stronger user value "resume work faster" or "avoid raw tmux commands"? | Product owner | Before Phase 2 scope review |
| Is current-directory prefill helpful often enough to keep as the default naming behavior? | Product owner + test users | After first usability pass |
| Which Node versions and terminal environments are officially supported in Phase 1? | Engineering | Before release candidate |
| Should Phase 1 promise npm-only distribution, or mention future Homebrew support in docs? | Product owner | Before README finalization |
| Do we want to support `npm install -g` only in docs, or also recommend `npx` for trial use? | Product owner | Before README finalization |

### 8. Timeline & Phasing

**Phase 1 — Core MVP**

- Scaffold the Node + Ink CLI project.
- Implement tmux session detection.
- Implement direct mode for the empty state.
- Implement the centered session picker with `New session` first.
- Implement new-session naming input and existing-session selection.
- Document npm installation and basic usage.

**Phase 2 — Robustness & Fit**

- Improve edge-case handling for running inside tmux and for unusual environments.
- Add basic metadata polish and stronger error messaging.
- Validate usability with manual tests and refine copy/defaults.

**Phase 3 — Expansion**

- Consider search/filtering for larger session lists.
- Consider additional distribution options such as Homebrew.
- Consider configuration and customization only if core usage proves valuable.
