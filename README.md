```
 ██╗  ██╗██╗   ██╗███╗   ███╗ █████╗ ███╗   ██╗
 ██║  ██║██║   ██║████╗ ████║██╔══██╗████╗  ██║
 ███████║██║   ██║██╔████╔██║███████║██╔██╗ ██║
 ██╔══██║██║   ██║██║╚██╔╝██║██╔══██║██║╚██╗██║
 ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║██║ ╚████║
 ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝

  ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗██╗     ███████╗██████╗
 ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║██║     ██╔════╝██╔══██╗
 ██║     ██║   ██║██╔████╔██║██████╔╝██║██║     █████╗  ██████╔╝
 ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║██║     ██╔══╝  ██╔══██╗
 ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ██║███████╗███████╗██║  ██║
  ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
```

**Compile humans into AI agents.**

A Claude Code plugin that conducts deep behavioral interviews, reads work artifacts via MCP tools, and generates installable plugins that authentically embody a person's thinking, communication, and decision-making.

---

## How It Works

```
                    ┌─────────────────────────────────┐
                    │         /compile-human           │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │      8-Phase Deep Interview      │
                    │                                  │
                    │  1. Identity & Role               │
                    │  2. Communication Style           │
                    │  3. Decision-Making               │
                    │  4. Domain Expertise              │
                    │  5. Work Patterns                 │
                    │  6. Edge Cases                    │
                    │  7. Artifact Analysis (MCP)       │
                    │  8. Calibration & Corrections     │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   MCP Source Analysis             │
                    │                                  │
                    │   Notion ─── docs, meeting notes  │
                    │   Asana ──── tasks, projects      │
                    │   Chrome ─── web artifacts        │
                    │   Local ──── files, transcripts   │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │     Behavioral Profile (YAML)    │
                    │                                  │
                    │   ~/.human-compiler/<name>/      │
                    │   ├── profile.yaml               │
                    │   ├── phases/                    │
                    │   └── artifacts/                 │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │    Plugin Generator               │
                    │                                  │
                    │    Profile ──► Handlebars ──► Plugin│
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   Installable Claude Code Plugin  │
                    │                                  │
                    │   <name>-autonomous  (acts)       │
                    │   <name>-advisory   (advises)     │
                    │   /ask-<name>       (consults)    │
                    └─────────────────────────────────┘
```

---

## Quick Start

```bash
# 1. Install the plugin
claude --plugin-dir /path/to/HumanCompiler

# 2. Start the interview
/compile-human

# 3. After all 8 phases, install the generated agent
claude --plugin-dir ~/.human-compiler/<name>/output-plugin/<name>-agent
```

---

## Features

**Deep Behavioral Interview**
- 8 structured phases covering identity, communication, decisions, expertise, workflows, edge cases
- 10-20 adaptive questions per phase with follow-up probes
- Concrete examples over abstractions — captures real behavior, not aspirations

**MCP-Powered Artifact Analysis**
- Reads Notion pages, meeting notes, strategy docs for communication style
- Analyzes Asana tasks and projects for work patterns
- Cross-references artifacts with interview answers for authenticity

**Progressive & Resumable**
- Saves after every phase — never lose progress
- `/compile-human resume` picks up where you left off
- `/compile-human status` shows progress at a glance

**Configurable Autonomy**
- **Autonomous mode** (`acceptEdits`): Agent acts, decides, and communicates as the person
- **Advisory mode** (`plan`, read-only): Agent recommends in the person's style without acting

**Marketplace-Ready Output**
- Generates a complete Claude Code plugin with manifest, agents, skills, CLAUDE.md
- Install via `--plugin-dir` or distribute through plugin marketplace

---

## Output Plugin Structure

```
<name>-agent/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── agents/
│   ├── <name>-autonomous.md     # Full autonomy agent
│   └── <name>-advisory.md       # Advisory-only agent
├── skills/
│   ├── ask-<name>/
│   │   └── SKILL.md             # "What would <name> do?"
│   └── <domain>-advice-<name>/
│       └── SKILL.md             # Expertise-specific skill
└── CLAUDE.md                    # Agent documentation
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/compile-human` | Start a new interview |
| `/compile-human resume` | Resume an interrupted interview |
| `/compile-human status` | Check progress on all profiles |
| `/compile-human generate` | Force-generate plugin from current profile |

---

## Architecture

```
HumanCompiler/
├── .claude-plugin/plugin.json         # Plugin manifest
├── skills/compile-human/
│   ├── SKILL.md                       # Orchestrator skill
│   ├── interview-guide.md             # Interview methodology
│   └── phase-instructions/            # Per-phase question banks
│       ├── 01-identity.md
│       ├── 02-communication.md
│       ├── 03-decision-making.md
│       ├── 04-domain-expertise.md
│       ├── 05-work-patterns.md
│       ├── 06-edge-cases.md
│       ├── 07-artifact-analysis.md
│       └── 08-calibration.md
├── agents/interviewer.md              # Interview agent persona
├── scripts/
│   ├── profile-manager.ts             # Profile CRUD operations
│   ├── profile-manager-cli.ts         # CLI wrapper
│   ├── generate-plugin.ts             # Profile → Plugin generator
│   └── templates/                     # Handlebars templates
│       ├── plugin.json.hbs
│       ├── agent-autonomous.hbs
│       ├── agent-advisory.hbs
│       ├── skill-ask.hbs
│       ├── skill-task.hbs
│       └── claude-md.hbs
├── tests/                             # Full test suite
│   ├── profile-manager.test.ts
│   ├── template-render.test.ts
│   ├── generate-plugin.test.ts
│   └── e2e-interview-flow.test.ts
├── package.json
└── CLAUDE.md
```

---

## Profile Schema

The behavioral profile captures:

| Section | What it records |
|---------|----------------|
| **Identity** | Role, org, team, responsibilities, goals |
| **Communication** | Writing style, tone spectrum, patterns, vocabulary |
| **Decision-Making** | Framework, prioritization, uncertainty handling, tradeoffs |
| **Expertise** | Domains (with depth), technical skills, industry knowledge |
| **Work Patterns** | Daily routine, tools, collaboration, meetings, task management |
| **Edge Cases** | Conflict resolution, ambiguity, failure response, scenarios |
| **Artifacts** | Analyzed documents, cross-artifact patterns |
| **Calibration** | Corrections, additions, confidence score |

---

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run specific test suite
bun test profile-manager
bun test template-render
bun test generate-plugin
bun test e2e

# Generate a plugin from a profile
bun run scripts/generate-plugin.ts ~/.human-compiler/<name>/profile.yaml
```

---

## How the Interview Works

Each phase follows a consistent pattern:

1. **Read phase instructions** — load the question bank and MCP guidance
2. **Query MCP sources** — search Notion, Asana, etc. for relevant artifacts
3. **Conduct adaptive interview** — ask questions, follow interesting threads
4. **Cross-reference artifacts** — validate answers against real work products
5. **Record structured data** — update the YAML profile
6. **Save raw transcript** — preserve the full conversation for reference
7. **Summarize and confirm** — present findings, ask for corrections
8. **Transition** — move to the next phase

The final calibration phase presents the complete profile for review and correction, ensuring the compiled agent is authentically representative.

---

## License

MIT
