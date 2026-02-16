# HumanCompiler

## Project Overview
A Claude Code plugin that compiles humans into AI agents through deep behavioral interviews.

## Architecture
- `skills/compile-human/SKILL.md` — Main orchestrator skill (`/compile-human`)
- `agents/interviewer.md` — Dedicated interview agent
- `scripts/profile-manager.ts` — Profile CRUD (init, load, update, finalize)
- `scripts/generate-plugin.ts` — Generates output Claude Code plugins from profiles
- `scripts/templates/*.hbs` — Handlebars templates for generated plugin files

## Commands
- `bun install` — Install dependencies
- `bun test` — Run all tests
- `bun run scripts/generate-plugin.ts <profile-path>` — Generate plugin from profile

## Conventions
- TypeScript with strict mode, ES modules
- Tests use vitest, co-located in `tests/`
- Profiles stored at `~/.human-compiler/<name>/profile.yaml`
- Generated plugins output to `~/.human-compiler/<name>/output-plugin/`
- YAML for profiles (human-readable), JSON for plugin manifests
- Handlebars templates for all generated files
