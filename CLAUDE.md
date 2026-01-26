# DemoScript - Development Guidelines

## Project Overview

DemoScript is a framework for creating scripted, shareable product demonstrations. Users write YAML files to define demo steps, and the framework provides a web UI for presenting and sharing demos.

## Architecture

- **Monorepo** using npm workspaces
- **packages/cli** - Node.js CLI tool for serving demos
- **packages/ui** - React + TypeScript + Vite web interface
- **packages/shared** - Shared utilities and types

## Key Files

- `DESIGN.md` - Full architecture and schema specification
- `demo.schema.json` - JSON Schema for YAML validation
- `examples/feature-showcase/demo.yaml` - Comprehensive feature demo
- `packages/ui/src/types/schema.ts` - TypeScript types for YAML schema
- `packages/cli/src/lib/validator.ts` - Schema validation logic

## Commands

```bash
# Install all dependencies
npm install

# Run UI development server (with hot reload)
npm run dev

# Build all packages
npm run build
```

## Build Script

Use `./build.sh` for a complete build that properly syncs UI assets to CLI:

```bash
# Full build (UI + CLI + sync assets)
./build.sh

# Clean build (removes old artifacts first)
./build.sh --clean

# Build and start dev server
./build.sh --serve

# Serve with custom demo path
./build.sh --serve ~/my-demo

# Serve with custom port
./build.sh --serve ~/my-demo --port 8080
```

## Development Workflow

1. UI development: `cd packages/ui && npm run dev`
2. Demo files go in `examples/<demo-name>/demo.yaml`
3. Test with the examples in `examples/hello-world/` or `examples/feature-showcase/`

## Code Conventions

- TypeScript strict mode
- React functional components with hooks
- Tailwind CSS for styling
- YAML for demo configuration

## YAML Schema Quick Reference

```yaml
title: "Demo Title"
description: "Description"
version: "1.0"
author: "Author Name"
tags:
  - api
  - tutorial

metadata:
  duration: "5 minutes"
  difficulty: beginner  # beginner | intermediate | advanced
  category: "Tutorial"

settings:
  base_url: "http://localhost:8000"
  openapi: "http://localhost:8000/docs/json"  # Auto-generate forms from OpenAPI

  theme:
    preset: "purple"  # purple | blue | green | teal | orange | rose

  effects:
    confetti: true
    sounds: true
    transitions: true

steps:
  - slide: |
      # Markdown content

  - rest: POST /endpoint
    title: "Step Title"
    defaults:
      field: "value"
    save:
      varName: response.path
    results:
      - key: id
        label: "ID"
        type: text

  - shell: command
    title: "Run Command"
```

## Variable Substitution

- Use `$variableName` to reference saved values
- Variables are saved with `save:` in REST/shell steps
- Variables work in endpoints, form defaults, and slide content

## CLI Commands

```bash
# Start dev server for live demo presentation
demoscript serve examples/feature-showcase --port 3000 --host
```

## Visual Editor

The Visual Editor for creating demos interactively is a **cloud-only feature** available at [demoscript.app/dashboard](https://demoscript.app/dashboard).

### Features

- **Drag-and-drop step reordering** - Reorder steps visually with drag handles
- **Live preview** - See step execution results in real-time with Execute button
- **Playback controls** - Play, pause, step through demo with speed control
- **Demo menu (New/Open/Save/Save As)** - Manage demos stored in the cloud
- **Per-step YAML editor** - Edit individual step YAML with live syntax validation
- **Settings panel** - Configure title, description, API settings, theme, and effects
- **OpenAPI integration** - Auto-generate form fields from OpenAPI specs
- **Visual effects** - Confetti and sound effects on step completion

### Access

1. Go to [demoscript.app/dashboard/new](https://demoscript.app/dashboard/new)
2. Click "Visual Editor" tab
3. Build demos interactively and save to your account

## Sandbox API

DemoScript includes a built-in Sandbox API for testing demos without external dependencies.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sandbox/health` | Health check |
| `GET` | `/sandbox/openapi.json` | OpenAPI 3.0 specification |
| `POST` | `/sandbox/auth/login` | Mock authentication |
| `GET/POST` | `/sandbox/users` | List/create users |
| `GET/PUT/DELETE` | `/sandbox/users/{id}` | User CRUD |
| `GET/POST` | `/sandbox/jobs` | Async job management |
| `POST` | `/sandbox/echo` | Echo request body |
| `GET` | `/sandbox/error/{code}` | Generate HTTP errors |

### Usage

```yaml
settings:
  base_url: "/sandbox"
  openapi: "/sandbox/openapi.json"

steps:
  - rest: POST /auth/login
    defaults:
      email: "demo@example.com"
      password: "demo123"
    save:
      token: token
```

See `examples/sandbox-demo/` for a complete example.
