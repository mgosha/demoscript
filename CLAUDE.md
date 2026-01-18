# DemoScript - Development Guiaines

## IMPORTANT: Two Repositories

This project has TWO separate repositories with different purposes:

| Repository | GitHub | Local Path | Purpose | License |
|------------|--------|------------|---------|---------|
| **Private** (this one) | `mgosha/demoscript-studio` | `~/projects/demoscript` | Cloud platform, commercial features, future Tauri/Rust desktop app | Proprietary |
| **Public** | `mgosha/demoscript` | `~/projects/demoscript-public` | Free open-source player (MIT), published to npm and GitHub | MIT |

**Key differences:**
- **Private repo** contains: cloud proxy code (`packages/cloud`), cloud-execute helpers, Pro/Team features
- **Public repo** contains: basic CLI (`serve`, `login`, `logout`, `whoami`, `push`), UI viewer, effects - NO build/record/deploy/tunnel commands

**When syncing changes:**
- UI improvements (styling, UX) → sync to BOTH repos
- Cloud-specific code → private repo ONLY
- New free features → public repo first, then merge to private

**Syncing to public repo:**
```bash
# Use the sync script (handles all exclusions automatically)
./scripts/sync-to-public.sh           # Sync and show changes
./scripts/sync-to-public.sh --commit  # Sync and auto-commit
./scripts/sync-to-public.sh --dry-run # Preview what would change
```

**Files that differ between repos:**
- `packages/ui/src/lib/execute-adapter.ts` - Private has cloud proxy, public is local-only
- `packages/cli/src/index.ts` - Private has all commands, public has only `serve`
- `packages/cli/src/commands/serve.ts` - Private has tunnel options

See `docs/GO-TO-MARKET.md` for the full Open Core strategy.

---

## Project Overview

DemoScript is a framework for creating scripted, shareable product demonstrations. Users write YAML files to define demo steps, and the framework provides a web UI for presenting and sharing demos.

## Architecture

- **Monorepo** using npm workspaces
- **packages/cli** - Node.js CLI tool for serving, recording, and building demos
- **packages/ui** - React + TypeScript + Vite web interface

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

# Build all packages (simple)
npm run build
```

## Build Script

Use `./build.sh` for a complete build that properly syncs UI assets to CLI:

```bash
# Full build (UI + CLI + sync assets)
./build.sh

# Clean build (removes old artifacts first)
./build.sh --clean

# Build and start dev server (default: examples/feature-showcase, port 3001, all interfaces)
./build.sh --serve

# Serve with custom demo path
./build.sh --serve ~/my-demo

# Serve with custom port
./build.sh --serve ~/my-demo --port 8080

# Serve with tunnel
./build.sh --serve --tunnel

# Build RPM package (requires rpmbuild)
./build.sh --rpm

# Build DEB package (requires dpkg-buildpackage)
./build.sh --deb

# Build all packages (RPM + DEB)
./build.sh --packages

# Skip specific builds (use existing)
./build.sh --skip-ui    # Skip UI, rebuild CLI only
./build.sh --skip-cli   # Skip CLI, rebuild UI only
```

**Why use build.sh instead of npm run build?**

The `npm run build` command builds UI and CLI separately but doesn't sync the UI assets to CLI's `ui-dist/` folder. The CLI serve command looks for pre-built UI in `packages/cli/dist/ui-dist/`. Without syncing:
- Changes to UI won't appear when running `node packages/cli/dist/index.js serve`
- You may see blank screens or stale CSS/JS

The `build.sh` script handles this automatically.

## Cloud Deployment

The Cloudflare Worker (`packages/cloud`) can be deployed via build.sh:

```bash
# Deploy cloud worker only (quick)
./build.sh --cloud

# Build everything + deploy cloud worker
./build.sh --deploy
```

The script auto-sources `.envrc` for `CLOUDFLARE_API_TOKEN`. If not using .envrc, set the env var manually.

Note: GitHub Actions CI does NOT auto-deploy the cloud worker. Only the gallery (GitHub Pages) is auto-deployed on push.

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

# Metadata for gallery display
metadata:
  duration: "5 minutes"
  difficulty: beginner  # beginner | intermediate | advanced
  category: "Tutorial"

settings:
  base_url: "http://localhost:8000"
  openapi: "http://localhost:8000/docs/json"  # Auto-generate forms from OpenAPI

  # Authentication (optional)
  auth:
    enabled: true
    password: "demo123"           # Password for protected demos
    message: "Enter password"     # Custom login message

  # Dashboard (optional)
  dashboard:
    enabled: true                 # Show overview on load
    show_stats: true              # Show step count, duration
    show_health: true             # Show service health
    show_description: true        # Show demo description

  # Sidebar navigation (optional)
  sidebar:
    enabled: true                 # Show sidebar
    collapsed: false              # Start collapsed
    show_status: true             # Show completion checkmarks

  # Theme configuration (optional)
  theme:
    preset: "purple"              # purple (default) | blue | green | teal | orange | rose
    # Or custom colors (overrides preset):
    # primary: "#8b5cf6"          # Main brand color (hex)
    # accent: "#06b6d4"           # Secondary accent (hex)
    mode: "auto"                  # auto | light | dark (force mode)

  # Visual effects (all default: true)
  effects:
    confetti: true                # Celebration on step completion
    sounds: true                  # Success/error audio
    transitions: true             # Step change animations
    counters: true                # Animated numeric values
    neon_glow: true               # Neon text effects (dark mode)
    grid_background: true         # Animated grid background
    glow_orbs: true               # Floating glow orbs
    sound_volume: 0.3             # Sound volume (0-1)

  # Health checks (optional)
  health_checks:
    - name: "API Server"
      url: "${base_url}/health"
    - name: "Database"
      url: "http://localhost:5432/health"

  # Dashboard data cards (optional) - live stats fetched from API
  dashboard:
    data_cards:
      - label: "Total Users"
        url: "${base_url}/stats"
        value: user_count          # JSON path to extract
        type: number               # number | text | currency | link
        poll_interval: 30000       # Refresh every 30s
      - label: "Status"
        value: "Active"            # Static value (no url)
        type: text
      - label: "API Docs"
        url: "https://api.example.com/docs"
        type: link

    # Data lists (optional) - item lists with cards or table layout
    data_lists:
      - label: "Recent Activity"
        url: "${base_url}/activity"
        items: items               # JSON path to array
        layout: cards              # cards | table
        limit: 5
        poll_interval: 30000
        empty_message: "No activity yet"
        card:
          badges:
            - key: type
              variants:
                create: success
                update: info
            - key: status
          title:
            key: title
            type: text
          fields:
            - key: id
              label: "ID"
              type: mono
            - key: userId
              label: "User"
              type: address
              link: github         # Uses configured link handler
            - key: createdAt
              type: relative_time
      # Alternative table layout
      - label: "Activity History"
        url: "${base_url}/activity"
        items: items
        layout: table
        columns:
          - key: type
            label: "Type"
          - key: title
            label: "Title"
          - key: userId
            label: "User"
            type: address
            link: github

steps:
  - slide: |
      # Markdown content

  - rest: POST /endpoint
    title: "Step Title"
    show_curl: true               # Show curl command for this request
    defaults:                     # Set defaults for OpenAPI-generated fields
      field: "value"
    form:                         # Manual override (optional)
      - name: field
        default: "value"
        type: text                # text | number | select | textarea | toggle | slider
    save:
      varName: response.path
    results:                      # Display specific response fields
      - key: id
        label: "ID"
        type: text                # text | address | tx | token | link | currency | code | table | json
        link: "github"            # Optional: configured link handler (github, jira, etc.)

  - shell: command
    title: "Run Command"
```

## Variable Substitution

- Use `$variableName` to reference saved values
- Variables are saved with `save:` in REST/shell steps
- Variables work in endpoints, form defaults, and slide content

## OpenAPI Integration

When `settings.openapi` is configured, DemoScript automatically integrates with your API specification:

### Auto-generated Forms (Request Body)
Form fields are automatically generated from OpenAPI request body schemas. Use `defaults:` to pre-fill values:

```yaml
- rest: POST /users
  defaults:
    email: "demo@example.com"
    role: "admin"
```

### Auto-generated Results (Response Schema)
When a REST step doesn't specify `results:`, fields are auto-generated from the OpenAPI response schema with intelligent type mapping:

| OpenAPI Schema | DemoScript Type |
|----------------|-----------------|
| `format: date-time` | `relative_time` |
| `format: uri` | `link` |
| `format: uuid` | `mono` |
| Property name contains `id` | `mono` |
| Property name contains `url`/`link` | `link` |
| Property name contains `price`/`amount`/`balance` | `currency` |
| Property name contains `address`/`wallet` | `address` |
| Property name contains `hash`/`tx` | `tx` |
| `type: array` or `type: object` | `json` |
| default | `text` |

**Override:** Specify `results:` explicitly to override auto-generation.

## Current Status

- [x] Design document
- [x] Project structure
- [x] TypeScript types
- [x] Core UI components
- [x] CLI tool implementation
- [x] Dev server with execution proxy
- [x] Static site builder
- [x] Branching and navigation (id, goto, choices)
- [x] Try It mode (live execution in recorded playback)
- [x] JSON Schema validation
- [x] Dual syntax support (concise and explicit)
- [x] Step groups
- [x] Browser step screenshot capture
- [x] Video export (MP4)
- [x] GIF export
- [x] OpenAPI integration (auto-generate forms and results from API specs)
- [x] Visual effects (confetti, sounds, transitions, counters)
- [x] Authentication (password protection for demos)
- [x] Dashboard (overview screen with health checks)
- [x] Enhanced visual effects (neon glow, grid background, glow orbs)
- [x] Sidebar navigation (collapsible step list)
- [x] cURL command display (show_curl option)
- [x] Result type rendering (address, tx, link, code, table, json, currency, mono, relative_time)
- [x] Step retry and skip on error
- [x] Blockchain visualization (async progress animation)
- [x] Gallery metadata (duration, difficulty badges)
- [x] Sound system enhancements (volume control, additional sounds)
- [x] Dashboard data cards (live API stats display)
- [x] Dashboard data lists (cards/table layouts for transactions)
- [ ] Full testing

## CLI Commands

```bash
# Start dev server for live demo presentation
demoscript serve examples/feature-showcase --port 3000 --host

# Start server with public ngrok tunnel (requires ngrok installed)
demoscript serve examples/feature-showcase --tunnel

# Start server with cloudflare tunnel (requires cloudflared installed)
demoscript serve examples/feature-showcase --tunnel cloudflare

# Start server with authenticated ngrok tunnel
demoscript serve examples/feature-showcase --tunnel --tunnel-auth "user:password"

# Record all steps to recordings.json (includes browser screenshots)
demoscript record examples/feature-showcase

# Build static site for single demo
demoscript build examples/feature-showcase -o dist

# Build all demos with gallery index
demoscript build examples --all -o dist

# Export demo as MP4 video (requires build first)
demoscript export-video examples/browser-demo -o demo.mp4

# Export demo as animated GIF (with optimization)
demoscript export-gif examples/browser-demo -o demo.gif --optimize

# Cloud commands
demoscript login                              # Login to DemoScript Cloud
demoscript logout                             # Logout from DemoScript Cloud
demoscript whoami                             # Show current logged in user
demoscript push examples/feature-showcase     # Push demo to cloud
demoscript push . --slug my-demo --private    # Push with custom slug and visibility
```

Note: Use `npx demoscript` instead if running from source during development.

## CLI Features

- **serve**: Express + Vite dev server with `/api/demo`, `/api/execute`, `/api/execute-shell` endpoints. Supports `--tunnel` for public URLs (ngrok default, or cloudflare) and `--tunnel-auth` for HTTP basic auth (ngrok only).
- **record**: Executes REST and shell steps, saves responses to recordings.json, captures browser screenshots
- **build**: Generates static sites with embedded config, supports `--all` for gallery index
- **export-video**: Captures demo frames with Puppeteer, encodes to MP4 with ffmpeg
- **export-gif**: Captures demo frames, encodes to GIF with optional palette optimization
- **login/logout/whoami**: Authenticate with DemoScript Cloud, credentials stored in `~/.demoscript/config.json`
- **push**: Upload demos to DemoScript Cloud (YAML + recordings), creates or updates existing demos

## Tunnel Options

The `--tunnel` option supports two tunnel providers:

| Provider | Command | Auth Support | Notes |
|----------|---------|--------------|-------|
| **ngrok** | `--tunnel` or `--tunnel ngrok` | `--tunnel-auth user:pass` | Default, requires [ngrok](https://ngrok.com/download) installed |
| **cloudflare** | `--tunnel cloudflare` | No (use Cloudflare Access) | Requires [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed |

### Quick Tunnels (No Setup)

Cloudflare quick tunnels use random trycloudflare.com URLs with no account required:

```bash
demoscript serve examples/feature-showcase --tunnel cloudflare
```

### Named Tunnels (Custom Domain)

For a stable URL with your own domain, set up a named Cloudflare tunnel:

```bash
# 1. Create tunnel (one-time setup)
cloudflared tunnel create demoscript

# 2. Route DNS to tunnel (one-time setup)
cloudflared tunnel route dns demoscript demo.yourdomain.com

# 3. Run with named tunnel
demoscript serve examples/feature-showcase --tunnel-name demoscript --tunnel-hostname demo.yourdomain.com
```

For authentication with Cloudflare, configure [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) policies on your tunnel.
