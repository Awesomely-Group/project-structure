# ERP — Claude Code Context

This file is read automatically by Claude Code on every session.

---

## Project Overview

**ERP** — ERP intern

**Key constraints:**
<!-- TODO: Document key constraints -->

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript | Primary language |
| Package Manager | pnpm | Dependency management |
<!-- TODO: Complete tech stack table -->

---

## Project Structure

<!-- TODO: Document project structure -->

---

## Architecture

<!-- TODO: Describe architecture pattern (MVC, DDD, Clean Architecture, etc.) -->

---

## Code Conventions

### General
- **Never use `any`** in TypeScript — use `unknown` and narrow
- **Explicit return types** for functions and methods
- **Use `??`** not `||` for nullish coalescing

### Git
- Conventional Commits: `type: description`
- Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`
- **NEVER add Co-Authored-By or AI attributions**
- **NEVER add AI branding to PR descriptions**

---

## Development Commands

Install: pnpm install
Dev: pnpm dev
Test: pnpm test
Typecheck: pnpm typecheck
Lint: pnpm lint
Format: pnpm format

---

## Testing Strategy

<!-- TODO: Define test pyramid (unit/integration/e2e) -->

---

## CI/CD

<!-- TODO: Document CI/CD pipelines -->

---


## Tooling — Claude Code Marketplace

Skills, agents and commands are no longer vendored in `.claude/`. They are provided
by the private **`awesomely-internal`** marketplace
(`https://github.com/Awesomely-Group/claude-marketplace`). Install once per machine:

```text
/plugin marketplace add Awesomely-Group/claude-marketplace
/plugin install core-dev@awesomely-internal          # required
/plugin install orchestration@awesomely-internal     # optional (Claude Flow v3)
```

Plugin skills are namespaced `core-dev:<skill>` / `orchestration:<skill>`; agents
are referenced by their name. The sections below list which plugin provides what.

## Web Frontend
### Skills: core-dev:senior-frontend (React, Next.js, TypeScript, Tailwind)
### Agents: web-frontend-dev (core-dev)
### Principles: Functional components only, Server components by default, Error boundaries, Tailwind CSS

## Backend Development
### Skills: core-dev:senior-backend (Node.js, Express, PostgreSQL, Prisma)
### Agents: backend-api-dev, system-architect (core-dev)
### Principles: DDD architecture, Result pattern, Validate DTOs at HTTP layer, Domain events

## UI/UX Design
### Skills: core-dev:ui-design, core-dev:figma-integration
### Agents: ui-design-dev (core-dev)
### Principles: WCAG 2.1 AA, contrast>=4.5:1, keyboard accessible, design tokens, dark mode

## Security
### Skills: core-dev:security (OWASP Top 10, auth, secrets, dependency scanning)
### Agents: security-auditor (core-dev)
### Principles: Validate inputs, no hardcoded secrets, scan dependencies, HTTPS everywhere

## DevOps & CI/CD
### Skills: core-dev:devops (GitHub Actions, Docker, deployment, monitoring)
### Agents: cicd-engineer (core-dev)
### Principles: Cache dependencies, multi-stage Docker builds, secret management, health checks

## Claude Flow v3 — Multi-Agent Orchestration

### Overview
Provided by the optional **`orchestration`** plugin (not local config — the previous
`.claude/helpers/`, hooks and `.mcp.json` were removed in favour of the plugin). Claude
Code performs ALL actual work (file ops, code generation, git). MCP tools ONLY handle
coordination (swarm, memory, routing, messaging).

### Quick Reference
```bash
# Spawn agents
npx ruflo agent spawn -t coder --name my-coder
npx ruflo agent spawn -t tester --name my-tester

# Initialize swarm
npx ruflo swarm init --topology hierarchical --max-agents 8

# Hive-mind tasks
npx ruflo hive-mind spawn "Build feature X" --queen-type tactical
npx ruflo hive-mind status

# Memory operations
npx ruflo memory store <key> <value> --namespace <ns>
npx ruflo memory search --query "pattern"

# Background daemon (learning workers)
npx ruflo daemon start

# System health
npx ruflo doctor
npx ruflo status
```

### Architecture Principles
- **Task Routing**: 3-tier routing (WASM booster → Haiku/Sonnet → Opus + Swarm)
- **Swarm Topologies**: Hierarchical, Mesh, Ring, Star, Hybrid, Adaptive
- **Memory**: Hybrid backend with HNSW vector indexing for fast semantic search
- **Hooks**: Auto-routing via PreToolUse, PostToolUse, SessionStart, SessionEnd hooks
- **SONA**: Self-Optimizing Neural Architecture learns from every task execution

### Skills: orchestration:swarm-orchestration
### Agents: swarm-coordinator, task-router (orchestration)
### Principles: Multi-agent coordination, hierarchical mesh topology, task decomposition, shared memory, consensus algorithms




---

## Current Phase

<!-- TODO: Document current development phase -->

---

**Last updated:** 2026-05-19
