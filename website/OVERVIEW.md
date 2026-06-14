# LiquidKit Website — Overview

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui |
| Liquid Renderer | liquidjs |
| Syntax Highlighting | shiki |
| Content | MDX (built-in Next.js) |
| Deployment | Vercel |

---

## Folder Structure

```
website/
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                        ← landing page
    │   ├── components/
    │   │   └── [slug]/
    │   │       └── page.tsx                ← component doc page
    │   └── api/
    │       └── preview/
    │           └── route.ts                ← liquidjs renderer endpoint
    ├── components/
    │   ├── ui/                             ← shadcn primitives
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Sidebar.tsx
    │   └── preview/
    │       ├── ComponentPreview.tsx        ← srcdoc iframe wrapper
    │       └── CodeBlock.tsx              ← tabbed code viewer (.liquid / .js / .css)
    ├── lib/
    │   ├── registry.ts                     ← fetch + parse registry.json from GitHub
    │   └── renderer.ts                     ← liquidjs render logic + mock data
    └── types/
        └── index.ts
```

---

## Naming Conventions

**Files & Folders**
- React components: `PascalCase.tsx` — `ComponentPreview.tsx`
- Utilities / lib: `camelCase.ts` — `registry.ts`, `renderer.ts`
- Route folders: `kebab-case` — `components/[slug]/`

**Variables & Functions**
- Functions: `camelCase` — `renderComponent()`, `fetchRegistry()`
- Types/Interfaces: `PascalCase` — `ComponentMeta`, `RegistryEntry`
- Constants: `SCREAMING_SNAKE_CASE` — `GITHUB_RAW_BASE_URL`

**CSS**
- Tailwind utility classes only — no custom CSS in the docs site
- Component previews are isolated in `srcdoc` iframes — no class bleed

---

## Preview Architecture

```
/components/[slug] page loads
→ calls /api/preview?component=announcement-bar
→ route.ts fetches .liquid file from GitHub raw
→ liquidjs renders it with mock data
→ returns HTML string
→ ComponentPreview.tsx injects into <iframe srcdoc={html} />
```

Mock data per component lives in `src/lib/renderer.ts` alongside the render logic.

---

## Key Constraints

- Never fetch component files at build time — always runtime from GitHub raw so previews stay in sync with the repo
- `srcdoc` iframe sandboxed with `allow-scripts` only — no `allow-same-origin`
- No custom CSS in the docs site outside of Tailwind — all design tokens are Tailwind tokens, not `lk-*`