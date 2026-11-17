<p align="center">
  <a href="https://ops-handbook-dvp.pages.dev/">
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcset="public/logo/logo-dark.svg"
      />
      <img src="public/logo/logo-light.svg" alt="Ops Handbook" width="280" />
    </picture>
  </a>
</p>

<h1 align="center">Ops Handbook</h1>

<p align="center">
  <strong>An open-source, production-grade DevOps knowledge base and engineering learning platform.</strong>
</p>

<p align="center">
  <a href="https://ops-handbook-dvp.pages.dev/"><img src="https://img.shields.io/badge/Live_Site-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare Pages" /></a>
  <a href="https://astro.build"><img src="https://img.shields.io/badge/Framework-Astro_5-BC52EE?style=flat-square&logo=astro&logoColor=white" alt="Astro" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Styling-Tailwind_CSS_4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/Language-TypeScript_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

<p align="center">
  <a href="https://ops-handbook-dvp.pages.dev/">Live Demo</a> •
  <a href="#core-pillars">Core Pillars</a> •
  <a href="#technology-stack">Stack</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#authoring-content">Authoring</a> •
  <a href="#architecture">Architecture</a>
</p>

---

## Overview

**Ops Handbook** is a structured, production-first engineering repository designed for DevOps practitioners, systems administrators, and cloud engineers.

Rather than casual blog posts, the handbook offers structured, reproducible knowledge: practical labs, architectural diagrams, real-world troubleshooting scenarios, interactive command cheat sheets, and technical interview guides.

All content is authored in version-controlled **Markdown/MDX files** within this repository as the single source of truth. The platform builds into an ultra-fast, zero-runtime static site deployed globally via Cloudflare Pages.

---

## Core Pillars

The platform is organized across three primary learning pillars:

| Pillar | Description | Path |
| :--- | :--- | :--- |
| **Documentation** | Deep-dive guides, architectural breakdowns, hands-on labs, and production troubleshooting notes across 14 infrastructure domains. | `/docs` |
| **Cheat Sheets** | Curated, high-velocity command cards with explanations, use cases, copy-to-clipboard actions, and instant live filtering. | `/cheat-sheets` |
| **Interview Questions** | Real-world technical interview challenges categorized by difficulty (`Beginner`, `Intermediate`, `Advanced`) with direct answers and common pitfalls. | `/interview-questions` |

---

## Technology Stack

Ops Handbook avoids unnecessary runtime complexity, databases, heavy frontend frameworks, and server overhead:

```text
┌────────────────────────────────────────────────────────┐
│                      Ops Handbook                      │
├───────────────────┬────────────────────────────────────┤
│ Framework         │ Astro 5 (pure static output)       │
│ Language          │ TypeScript (strict mode)           │
│ Styling           │ Tailwind CSS 4 (via Vite plugin)   │
│ Content Engine    │ Astro Content Collections (glob)   │
│ Code Highlighting │ Shiki (Gruvbox dual theme)         │
│ Diagrams          │ Mermaid.js (lazy client runtime)   │
│ Fonts             │ JetBrains Mono & modern sans stack │
│ Search            │ Build-time index + zero-dep modal  │
│ Deployment        │ Cloudflare Pages (global edge CDN) │
└───────────────────┴────────────────────────────────────┘
```

---

## Features

- **Blazing Fast Static Generation**: Zero client-side JavaScript required for core reading. Pages load instantly with pre-rendered HTML and minimal CSS.
- **Interactive Developer Terminal**: Hero section features an interactive, multi-session terminal emulator (Kubernetes, Linux, Knowledge Hub, Terraform) with live syntax highlighting, Starship prompt styling, and session controls.
- **Instant Client-Side Search**: Build-time generated search index accessible via `Ctrl+K` or `⌘K` with instant fuzzy keyword matching.
- **Shiki Dual-Theme Code Surfaces**: Code blocks maintain clean, readable dark terminal surfaces across both light and dark site themes with one-click copy buttons.
- **Dynamic Architecture Diagrams**: Native support for fenced ` ```mermaid ` blocks, dynamically loaded only on pages that contain diagrams.
- **Built-in MDX Components**: Ready-to-use, type-safe components (`<Callout>`, `<Steps>`, `<Figure>`, `<InfoCard>`, `<PdfCard>`, `<PdfEmbed>`, `<CheatSheet>`) available without manual imports.
- **Accessible & Responsive UX**: Complete keyboard navigation, dark/light theme persistence, reading progress indicator, smooth scroll-spy Table of Contents, and `prefers-reduced-motion` compliance.

---

## Quick Start

### Prerequisites

- **Node.js**: `v20.0.0` or later
- **npm**: `v10.0.0` or later

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/mustafammasoud/ops-handbook.git
cd ops-handbook

# Install dependencies
npm install

# Start local development server (http://localhost:4321)
npm run dev

# Run TypeScript and Astro diagnostics
npm run check

# Create production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```text
ops-handbook/
├── content/                     # Educational content (single source of truth)
│   ├── README.md                # Comprehensive content authoring manual
│   ├── _template/               # Starter template for new articles
│   ├── cheat-sheets/            # Cheat sheet collections (git, github, k8s, etc.)
│   ├── interview-questions/     # Technical Q&A (linux, k8s, git, etc.)
│   ├── devops-fundamentals/     # Core engineering concepts and culture
│   ├── operating-systems/       # Linux administration and internals
│   ├── networking/              # Protocols, subnetting, and service discovery
│   ├── version-control/         # Git internals and GitHub workflows
│   ├── containers/              # Docker, container runtimes, and registries
│   ├── container-orchestration/ # Kubernetes architecture and production ops
│   ├── ci-cd-automation/        # Pipelines, testing, and automated delivery
│   ├── infrastructure-as-code/  # Terraform, modules, and state management
│   └── observability/           # Metrics, logging, tracing, and alerts
├── public/                      # Static assets served at root
│   ├── logo/                    # Brand marks and theme-aware favicons
│   ├── pdf/                     # Downloadable reference sheets and manuals
│   └── icons/                   # Web app manifest icons
├── src/
│   ├── components/              # Reusable UI & MDX components
│   │   ├── AnimatedTerminal.astro # Interactive hero shell emulator
│   │   ├── CheatSheet.astro     # Command card tables with live filtering
│   │   ├── InterviewQuestion.astro # Question & answer revision cards
│   │   ├── Callout.astro        # Note, tip, warning, and lab callouts
│   │   ├── Search.astro         # Client-side search modal (⌘K)
│   │   └── TableOfContents.astro# Smooth scroll-spy navigation
│   ├── layouts/                 # BaseLayout, DocLayout, CheatSheetLayout, InterviewLayout
│   ├── pages/                   # File-based routing and landing pages
│   ├── styles/                  # Tailwind theme, CSS custom properties, typography
│   └── content.config.ts        # Content Collections schemas and validations
├── astro.config.mjs             # Astro platform configuration
└── package.json
```

---

## Authoring Content

Content is authored inside the `content/` directory using Markdown (`.md`) or MDX (`.mdx`).

### Frontmatter Example

Create a file such as `content/operating-systems/linux/process-management.mdx`:

```yaml
---
title: Linux Process Management
description: Comprehensive guide to inspect, monitor, and signal processes in Linux.
order: 3
level: intermediate             # beginner | intermediate | advanced
tags: [linux, processes, systemd]
draft: false
---

## Overview

Processes are the fundamental unit of execution in Linux...

<Callout type="tip" title="Quick Inspection">
Use `pgrep` combined with `pkill` to safely target daemon processes.
</Callout>
```

- **Automatic Folder Routing**: URLs and breadcrumbs reflect the folder hierarchy automatically (`/docs/operating-systems/linux/process-management`).
- **Zero-Import Components**: Use `<Callout>`, `<Steps>`, `<Figure>`, and `<InfoCard>` directly inside `.mdx` files without importing them.
- Refer to [`content/README.md`](content/README.md) for the complete authoring specification and code snippets.

---

## Architecture Principles

1. **Content as Source of Truth**: Documentation lives in version-controlled markdown, completely isolated from application logic.
2. **Deterministic Folder Discovery**: Tools and topic categories are derived directly from the filesystem structure rather than maintained in manual registries.
3. **Pure Static Deliverables**: The application compiles to static HTML, CSS, and lightweight scripts in `dist/`, eliminating server-side vulnerabilities and runtime dependencies.
4. **Resilient Typography & Theming**: Muted warm editorial tones for daylight reading, paired with deep midnight greens and warm ambers in dark mode. Monospaced elements utilize JetBrains Mono for optimal developer legibility.

---

## Deployment

Continuous integration and deployment are fully automated:

```text
git push origin main ──► GitHub Actions / Webhook ──► Cloudflare Pages ──► Global Edge CDN
```

The production release is live at [**ops-handbook-dvp.pages.dev**](https://ops-handbook-dvp.pages.dev/).

---

## License & Contributing

Contributions are welcome! Please open an issue to discuss proposed additions or submit a pull request following the guidelines in [`content/README.md`](content/README.md).

Licensed under the [MIT License](LICENSE).
