<p align="center">
  <a href="https://ops-handbook-dvp.pages.dev/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/logo/logo-dark.svg" />
      <img src="public/logo/logo-light.svg" alt="Ops Handbook" width="280" />
    </picture>
  </a>
</p>

**Ops Handbook** is an open-source DevOps knowledge base and learning platform, live at
[**ops-handbook-dvp.pages.dev**](https://ops-handbook-dvp.pages.dev/).
It is not a blog: it is structured documentation, practical labs, diagrams, screenshots,
code examples, troubleshooting notes and cheatsheets. The UI is English-only;
individual articles may declare `language: ar` to render their content region
as RTL for Arabic or mixed Arabic/English writing.

All educational content lives as **Markdown/MDX files in this repository** (source of truth).
The site is fully static and deployed on Cloudflare Pages.

## Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | [Astro](https://astro.build) 7 (static output)     |
| Language   | TypeScript (strict)                                |
| Styling    | Tailwind CSS 4 (Vite plugin)                       |
| Content    | Astro Content Collections (`glob` loader) + MDX     |
| Diagrams   | Mermaid (lazy-loaded, client-side)                 |
| Highlight  | Shiki (dual light/dark themes)                     |
| Hosting    | Static build → [Cloudflare Pages](https://ops-handbook-dvp.pages.dev/)  |

No backend, database, auth, CMS or React. Nothing that is not needed yet.

## Platform features

- **Content rendering** — Markdown/MDX with Shiki highlighting (light/dark dual
  themes), tables, blockquotes, `<details>`, callouts, steps and figures.
- **Search** — build-time JSON index + client-side dialog (Ctrl/⌘K or `/`),
  with Arabic-aware normalization (diacritics, alef/hamza, ta-marbuta). Zero
  search dependencies; the index is fetched lazily on first open.
- **Navigation** — sidebar grouped by documentation area and nested by tool
  (Area → Tool → Articles), breadcrumbs (Home / Docs / Area / Tool / Article),
  area pages, tool landing pages, prev/next links, scroll-spy table of
  contents, mobile disclosure menu, header nav.
- **Reading UX** — heading anchor links, copy buttons on code blocks, image
  lightbox, dark/light theme with persistence, skip link, reduced-motion support.
- **Images** — colocated images are optimized automatically by Astro; `Figure`
  component for captions.
- **PDF** — `PdfCard` (open in new tab / download) and `PdfEmbed` (native
  browser preview, no heavy viewer dependency). Files live in `public/pdf/`.
- **Mermaid** — diagrams render client-side; the library is lazy-loaded only on
  pages that contain one.

All authoring documentation (frontmatter, components, images, PDFs, direction
rules) lives in [`content/README.md`](content/README.md). A visual QA page for
every component is available at `/components-preview` (not linked in navigation).

## Commands

```bash
npm install       # install dependencies
npm run dev       # local dev server (http://localhost:4321)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run check     # TypeScript / Astro diagnostics
```

## Project structure

```text
├── content/                  # educational content (Markdown/MDX) — the source of truth
│   ├── README.md             # authoring guide (excluded from the build)
│   ├── _template/            # copy-me article template (excluded from the build)
│   │   └── article.mdx
│   ├── devops-fundamentals/  # Documentation Areas (empty folders = placeholders,
│   ├── operating-systems/    #   see docs-roadmap.md)
│   │   └── linux/            # second level = Technology / Tool
│   │       └── introduction.md
│   ├── networking/
│   ├── version-control/
│   │   └── git/
│   ├── programming-scripting/
│   ├── containers/
│   │   └── docker/
│   │       ├── introduction.md
│   │       └── images/       # topic folder with colocated assets
│   │           ├── index.mdx
│   │           ├── images/   # images colocated with their document
│   │           └── resources/
│   ├── ci-cd-automation/
│   ├── container-orchestration/
│   │   └── kubernetes/
│   │       ├── overview.md
│   │       └── pods/
│   ├── cloud-platforms/
│   ├── infrastructure-as-code/
│   ├── configuration-management/
│   ├── observability/
│   ├── security-devsecops/
│   └── troubleshooting-production/
├── public/
│   ├── images/               # shared static images
│   ├── logo/                 # brand marks (mark + wordmark, light/dark SVG; favicon)
│   └── pdf/                  # static PDF resources (served as-is)
├── src/
│   ├── components/           # Header, Search, Sidebar, TableOfContents, ThemeToggle,
│   │                         # Callout, Steps, Figure, PdfCard, PdfEmbed,
│   │                         # CategoryCard, CategoryIcon, ReadingProgress,
│   │                         # RelatedTopics, DocEnhancements, MermaidRuntime
│   ├── layouts/              # BaseLayout, DocLayout (docs shell)
│   ├── pages/                # routes: /, /docs, /docs/[category],
│   │                         # /docs/[area]/[tool], /docs/[...slug],
│   │                         # /search-index.json, /components-preview, 404
│   ├── data/                 # category metadata
│   ├── utils/                # shared helpers (doc URL mapping, canonical order)
│   ├── styles/global.css     # design tokens, prose, RTL/LTR, themes, search dialog
│   └── content.config.ts     # content collection schema
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── docs-roadmap.md           # content blueprint (living document)
└── README.md
```

## Writing content

Create a file under `content/<area>/<tool>/<topic>.md` (or `.mdx`) and fill in the frontmatter
(start from `content/_template/article.mdx`):

```yaml
---
title: البودات (Pods)
description: الوحدة الأساسية في كوبرنيتيس.
# category / tool are derived from the folders — normally omitted
order: 2                            # sort order inside the sidebar group
level: beginner                     # beginner | intermediate | advanced
tags: [kubernetes, pods]
draft: false                        # drafts are excluded from the build
# language: ar                      # optional — article region RTL (default: en)
---
```

Only `title` is required: `category` and `tool` are **derived from the directory
structure**. The folder path sets the URL —
`content/container-orchestration/kubernetes/pods/index.mdx` serves
`/docs/container-orchestration/kubernetes/pods` — and every tool with at least
one article gets a landing page at `/docs/<area>/<tool>` automatically.

Content conventions:

- **Images**: colocate them next to the document
  (`content/container-orchestration/kubernetes/pods/images/pod-lifecycle.svg`) and
  reference them with a relative path (`![alt](./images/pod-lifecycle.svg)`). Astro
  optimizes SVG/PNG/WebP automatically.
- **PDFs**: either colocated with the document (`content/<area>/<tool>/<topic>/resources/x.pdf`,
  imported in MDX) or site-wide in `public/pdf/` linked with `/pdf/<file>.pdf`.
- **Diagrams**: use a ` ```mermaid ` fenced block — it renders as a diagram client-side
  (Mermaid is only downloaded on pages that contain one).
- **Callouts / steps / figures / PDF embeds**: MDX components available **without any
  import** — see [`content/README.md`](content/README.md) for the full authoring guide
  with snippets.
- **Direction**: the document `language` sets `lang`/`dir` on the **article region** only;
  the page chrome is always English (`lang="en" dir="ltr"`). Code blocks, terminals,
  YAML/JSON and inline code are always forced LTR.

## Content architecture principles

Content structure must remain flexible.

Adding, removing, or reorganizing topics should not require major code changes.

The platform should adapt to content, not force content into a rigid structure.

The living content blueprint (areas, example topics, evolution rules, current
limitations) lives in [`docs-roadmap.md`](docs-roadmap.md).

## Architecture decisions

1. **Content outside `src/`** — educational content lives in a repository-level `content/`
   folder, loaded by the `glob` loader in `src/content.config.ts`. Content stays clearly
   separated from application code; images colocated with documents are still optimized by
   Astro (verified in the production build).
2. **English-first chrome, content-driven direction** — the site UI is English-only
   (`lang="en" dir="ltr"`) with no language switcher; static HTML ships as-is with no
   client-side locale runtime. The prose region keeps its own `dir`/`lang` from content
   frontmatter (`language: ar` → RTL), everything technical (code blocks, inline code,
   tags, URLs, tool names) is isolated LTR via CSS, and layout uses CSS logical properties
   (`ms-*`, `ps-*`, `border-inline-start`) so the same markup works in both directions.
3. **Static output, no adapter** — `output: 'static'` so the `dist/` folder can be pushed
   straight to Cloudflare Pages (`git → GitHub → Cloudflare Pages`).
4. **Shiki dual themes** — `gruvbox-dark-medium` for both modes with
   `defaultColor: false`: code blocks are always dark terminal surfaces set into the
   warm paper UI, so dark mode is a CSS-only switch with no re-highlighting.
5. **Mermaid is lazy** — loaded via dynamic `import('mermaid')` only when a page actually
   contains a diagram; it never blocks pages without diagrams.
6. **Schema is single-sourced** — all frontmatter fields are declared once in
   `src/content.config.ts`; adding future fields (reading time, prerequisites,
   labs…) does not require restructuring.
7. **UI language ≠ content language** — the chrome (nav, labels, metadata,
   descriptions) is English-only; technical names (Linux, Docker, Kubernetes, CI/CD …)
   and authored content are never translated for the UI, while an article itself may be
   written in Arabic/English mix and opt into RTL via frontmatter.
8. **Search is a static index, not a service** — `/search-index.json` is
   generated at build time from the collection and fetched lazily by the search
   dialog. Matching runs in the browser with Arabic normalization (diacritics
   stripped, alef/hamza/ya/ta-marbuta unified) so Arabic queries work without a
   backend. The whole index is one small JSON file today (≈5 kB for the sample
   content); if the corpus grows to thousands of pages, the index generator can
   be swapped for Pagefind without touching the UI contract.
9. **Components over syntax** — MDX callouts/steps/PDF/image helpers are Astro
   components used with JSX syntax, so they stay typed and styled consistently;
   plain Markdown keeps working for everything else. The set is intentionally
   small (Callout, Steps, Figure, PdfCard, PdfEmbed) — more components are added
   only when content actually needs them. They are injected into every rendered
   MDX page via the `components` prop on `<Content />`, so authors use
   `<Callout>` with **no import line**; only asset values (image/PDF imports)
   remain explicit.

## Logo & brand

**Concept — “Atlas Plate”.** The mark is a rounded map plate (the atlas page /
manual) carrying a single plotted route: an orthogonal elbow like a transit map
or engineering diagram, ending in a terminus node. It reads as navigation,
infrastructure layers, and a structured knowledge journey in one geometric
form — no robots, clouds, whales, or gradients. The frame and route are
monochrome; exactly one element (the terminus node) carries the accent color.

Assets (SVG):

| File                                       | Use                                       |
| ------------------------------------------ | ----------------------------------------- |
| `public/logo/mark-light.svg` / `mark-dark.svg` | mark only (light / dark); also the theme-aware favicon |
| `public/logo/logo-light.svg` / `logo-dark.svg` | mark + “Ops Handbook” wordmark (light / dark) |

The wordmark uses the site’s system sans stack — “Ops” at medium weight,
“Handbook” at bold with slightly tightened tracking — so it always matches the
interface without shipping a font file. The header renders the mark inline
(`currentColor` frame/route + `fill-accent` node) so both themes follow the
color tokens automatically.

Usage rules:

- **Monochrome-first** — one mark, one accent node; never add gradients,
  shadows, or extra colors.
- Use light assets on light backgrounds and dark assets on dark backgrounds.
- Keep clear space around the mark of at least ¼ of its height.
- Minimum size: 24 px for the mark; the favicon stays legible at 16 px.
- Don’t stretch, rotate, recolor outside the palette (`#9a6b32` light / `#d0a45c` dark), or swap the route for other symbols.

## Deployment

```text
Local development → Git → GitHub → Cloudflare Pages → https://ops-handbook-dvp.pages.dev/
```

The site is live at [**ops-handbook-dvp.pages.dev**](https://ops-handbook-dvp.pages.dev/).
The build is a plain static site, so no adapter or server runtime is required.