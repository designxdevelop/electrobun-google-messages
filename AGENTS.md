# AGENTS.md

Project guidance for coding agents working in this repository.

## Agent Quickstart

- Read `src/bun/index.ts` and `electrobun.config.ts` before changing app behavior.
- Run `bun install` once, then use `bun run dev` while iterating.
- Run `bunx tsc -p tsconfig.json --noEmit` before handing off changes.
- If a bug is reported, add a reproducing test first when test infra exists.
- Keep navigation/session safeguards intact unless the task explicitly changes them.
- Do not introduce Electron APIs; this project uses Electrobun only.

## Electrobun Docs

- Quick start guide: https://blackboard.sh/electrobun/docs/guides/quick-start/
- General docs: https://blackboard.sh/electrobun/docs/
- LLM-oriented reference: https://blackboard.sh/electrobun/llms.txt

## Project Overview

- Runtime/tooling: Bun + TypeScript + Electrobun.
- Product: desktop wrapper for Google Messages Web.
- Main process entrypoint: `src/bun/index.ts`.
- View assets: `src/mainview/index.html`, `src/mainview/index.css`, `src/mainview/index.ts`.
- Build configuration: `electrobun.config.ts`.

## Hard Constraints

- Electrobun is not Electron.
- Never introduce Electron dependencies, APIs, or architecture.
- Preserve persistent session behavior (`persist:google-messages`) unless explicitly changing auth/session flow.
- Preserve URL navigation safety rules and external-link behavior.

## Repo Rules Discovery

- Checked `.cursor/rules/`: not present.
- Checked `.cursorrules`: not present.
- Checked `.github/copilot-instructions.md`: not present.
- If these files are added later, treat them as repo-level policy and follow them.

## Source Map

- `src/bun/index.ts`: menu wiring, window creation, navigation policy, notifications, edit commands.
- `src/mainview/*`: static view scaffold and styles.
- `electrobun.config.ts`: app metadata + platform build options + copied assets.
- `tsconfig.json`: strict TypeScript compiler policy.
- `package.json`: currently only `dev`, `build`, `start` scripts.

## Build / Run Commands

Run from repo root: `/Users/austin/code/dxd/elecbun-gmessage`.

```bash
bun install
bun run dev
bun run build
bun run start
```

## Lint / Typecheck / Test Commands

There is no dedicated lint script or test script yet.

Recommended quality gates:

```bash
# Typecheck
bunx tsc -p tsconfig.json --noEmit
```

If/when Bun tests are added:

```bash
# Run all tests
bun test

# Run one test file
bun test src/path/to/file.test.ts

# Run one test by name
bun test src/path/to/file.test.ts -t "exact test name"

# Run matching test names across files
bun test -t "partial test name"

# Optional watch mode
bun test --watch
```

## Single-Test Execution Notes

- Prefer running a single file while iterating.
- Use `-t` to target a single failing test name.
- Keep test names specific so `-t` filtering stays reliable.

## TypeScript Guidelines

- Keep strict mode assumptions intact; do not relax compiler options.
- Avoid `any`; prefer `unknown` plus explicit narrowing.
- Add explicit return types for exported functions and complex internal helpers.
- Model optional/nullable state intentionally and guard before use.
- Use small, composable functions over long procedural blocks.
- Reuse existing helpers/patterns before adding new abstractions.

## Imports and Module Boundaries

- Keep imports at file top.
- Group imports as external first, local second.
- Use `import type` for type-only imports.
- Remove unused imports promptly.
- Avoid deep imports unless package API requires them.

## Naming Conventions

- `camelCase`: variables/functions.
- `PascalCase`: types/interfaces/classes.
- `UPPER_SNAKE_CASE`: true constants.
- Regex constants should be suffix-labeled (`*_REGEX`).
- Prefer verb-first names for actions (`checkUnreadCount`, `runEditCommand`).

## Formatting Conventions

- Match existing style in touched files.
- Semicolons are standard in current TS files.
- Preserve existing indentation style local to each file.
- Keep multiline objects/arrays readable with consistent trailing commas where used.
- Avoid broad reformat-only diffs unless explicitly requested.
- Add comments only for non-obvious logic.

## Error Handling

- Guard runtime boundaries (RPC calls, DOM/eval interactions, navigation transitions).
- Use `try/catch` where transient runtime errors are expected.
- If intentionally ignoring errors, leave a concise reason comment.
- Never silently swallow errors without context at integration points.
- Validate external values before assuming shape/type.

## Async / Events / Lifecycle

- Prefer `async/await` over nested promise chains.
- Mark intentionally unawaited promises with `void`.
- Ensure timers/intervals are cleaned up on shutdown.
- Reset derived state on navigation events when assumptions change.
- Keep event handlers focused; delegate non-trivial logic to helpers.

## Security and Platform Behavior

- Maintain URL allowlisting behavior in navigation rules.
- Open unknown popups/externals via OS browser, not privileged app view.
- Escape interpolated JS payloads via safe serialization (`JSON.stringify`).
- Do not weaken partition, permission, or navigation defaults casually.

## Agent Workflow Expectations

- Read relevant files before editing.
- Make minimal, composable changes aligned with existing architecture.
- Avoid introducing tech debt for short-term speed.
- For bug reports: add/extend a test that reproduces the issue first, then fix.
- Run the most relevant validation commands for your change scope.
- Document any missing tooling/scripts in PR notes when applicable.

## If You Add Tooling Later

- Add scripts to `package.json` for lint/test/typecheck.
- Update this file with exact commands (including single-test examples).
- Keep command docs synced with real executable scripts.
- Prefer incremental adoption over repo-wide churn.
