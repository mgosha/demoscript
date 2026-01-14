# DemoScript

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A framework for creating scripted product demonstrations. Write YAML files to define demo steps, and DemoScript provides a polished web UI for presenting them.

![DemoScript Demo](assets/demo.gif)

## Features

- **YAML-based demos** - Define demos with a simple, readable schema
- **Multiple step types** - Slides, REST, Shell, Browser, Code, Wait, Assert, GraphQL, Database
- **Variable chaining** - Save values from responses and use them in subsequent steps
- **Branching flows** - Create choose-your-own-adventure demos with choices and navigation
- **Step groups** - Organize steps into collapsible sections
- **Live execution** - Execute API calls and commands in real-time
- **Try It mode** - Modify inputs and re-execute steps during presentation
- **Schema validation** - JSON Schema validates YAML with helpful error messages
- **Live reload** - Watch mode auto-refreshes on file changes
- **Visual effects** - Confetti, sounds, neon glow, animated backgrounds
- **Keyboard navigation** - Arrow keys, space, and shortcuts (press `?` for help)
- **Dark/Light mode** - Toggle theme support
- **Mobile responsive** - Works on tablets and phones

## Installation

```bash
npm install -g demoscript
```

Then run with:

```bash
demoscript serve ./my-demo
```

Or run directly with npx (no install required):

```bash
npx demoscript serve ./my-demo
```

**Requires:** Node.js >= 18

## Quick Start

1. Create a demo file `demo.yaml`:

```yaml
title: "My API Demo"
description: "Demonstrate our API capabilities"

settings:
  base_url: "https://api.example.com"

steps:
  - slide: |
      # Welcome
      This demo shows our API in action.

  - rest: GET /users/1
    title: "Fetch User"
    save:
      userId: id
      userName: name

  - slide: |
      # Done!
      Fetched user: $userName (ID: $userId)
```

2. Run the demo:

```bash
demoscript serve ./demo.yaml
```

## CLI Commands

### `demoscript serve <demo>`

Start a development server with live execution.

```bash
demoscript serve examples/hello-world --port 3000 --host
```

Options:
- `-p, --port <port>` - Port number (default: 3000)
- `-H, --host [host]` - Bind to 0.0.0.0 for LAN access
- `-w, --watch` - Watch demo files and auto-reload on changes
- `--no-open` - Don't auto-open browser

## YAML Schema

### Demo Configuration

```yaml
title: "Demo Title"           # Required
description: "Description"    # Optional
version: "1.0"               # Optional
author: "Author Name"        # Optional
tags: [tag1, tag2]           # Optional

settings:
  base_url: "https://api.example.com"
  openapi: "https://api.example.com/docs/json"  # OpenAPI spec URL

steps:
  # Step definitions...
```

### Step Types

#### Slide Step

Display markdown content:

```yaml
- slide: |
    # Heading

    Markdown content with **formatting** and $variables
  title: "Optional Title"
```

#### REST Step

Make HTTP API calls:

```yaml
- rest: POST /api/endpoint
  title: "Create Resource"
  headers:
    Authorization: "Bearer $token"
  form:
    - name: fieldName
      label: "Display Label"
      default: "default value"
      type: text
  save:
    varName: response.path.to.value
```

#### Shell Step

Execute shell commands:

```yaml
- shell: echo "Hello World"
  title: "Run Command"
  save:
    result: stdout
```

#### Browser Step

Open URLs in the browser:

```yaml
- browser: https://example.com/dashboard/$userId
  title: "View Dashboard"
```

#### Code Step

Display syntax-highlighted code snippets:

```yaml
- code: |
    const user = await api.getUser(id);
    console.log(user.name);
  language: javascript
  title: "Code Example"
```

#### Wait Step

Add timed delays with visual countdown:

```yaml
- wait: 2000
  message: "Processing..."
```

#### Assert Step

Validate conditions with pass/fail display:

```yaml
- assert: "$userId == 1"
  title: "Verify User ID"
```

### Variable Substitution

Use `$variableName` to reference saved values:

```yaml
- rest: GET /users/$userId
  headers:
    Authorization: Bearer $token
```

Variables are extracted using `save:` with dot notation paths:

```yaml
save:
  userId: id
  userName: data.user.name
```

### Visual Effects

Configure visual effects for engaging demos:

```yaml
settings:
  effects:
    confetti: true        # Fire confetti on step completion
    sounds: true          # Play success/error sounds
    transitions: true     # Animate step changes
    neon_glow: true       # Neon text effects (dark mode)
    grid_background: true # Animated grid background
    glow_orbs: true       # Floating glow orbs
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` or `Space` | Next step |
| `←` | Previous step |
| `R` | Reset demo |
| `?` | Show keyboard help |
| `Esc` | Close help dialog |

## DemoScript Studio

Need more features? **DemoScript Studio** offers:

- **Static export** - Build standalone HTML files deployable anywhere
- **Recording** - Capture API responses for offline playback
- **Video/GIF export** - Create shareable video demos
- **Deployment** - One-command deploy to Netlify
- **Public tunnels** - Share demos via ngrok or Cloudflare

Visit [demoscript.io](https://demoscript.io) for more information.

## Development

```bash
# Clone repository
git clone https://github.com/mgosha/demoscript
cd demoscript

# Install dependencies
npm install

# Run UI development server
npm run dev

# Build all packages
npm run build
```

## Project Structure

```
demoscript/
├── packages/
│   ├── cli/          # CLI tool (serve command)
│   └── ui/           # React web interface
├── examples/
│   └── hello-world/  # Starter demo
├── demo.schema.json  # JSON Schema for YAML validation
└── DESIGN.md         # Architecture documentation
```

## License

MIT
