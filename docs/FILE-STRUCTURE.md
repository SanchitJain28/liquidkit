# File Structure

## Repository Root

```
liquidkit/
├── packages/
│   ├── cli/
│   └── tokens/
├── components/
├── registry.json
├── docs/
├── .github/
│   └── workflows/
├── package.json          ← monorepo root (npm workspaces)
└── README.md
```

## Monorepo Setup

Root `package.json`:
```json
{
  "name": "liquidkit-root",
  "private": true,
  "workspaces": ["packages/*", "docs"]
}
```

`packages/cli` is published to npm as `liquidkit`.
`packages/tokens` is published as `@liquidkit/tokens`.
`components/` is never published — served via GitHub raw URLs.
`docs/` is deployed to Vercel independently.

---

## packages/cli

```
packages/cli/
├── bin/
│   └── cli.js                ← entry point, registers commands
├── src/
│   ├── commands/
│   │   ├── add.js            ← liquidkit add <component>
│   │   ├── list.js           ← liquidkit list
│   │   ├── info.js           ← liquidkit info <component>
│   │   └── update.js         ← liquidkit update <component>
│   └── utils/
│       ├── registry.js       ← fetch + parse registry.json from GitHub
│       ├── installer.js      ← download files, apply prefix, write to theme
│       ├── conflict.js       ← detect existing files, prompt skip/overwrite/rename
│       └── prompt.js         ← all terminal prompts (uses @inquirer/prompts)
└── package.json
```

`package.json` for CLI:
```json
{
  "name": "liquidkit",
  "version": "1.0.0",
  "bin": {
    "liquidkit": "./bin/cli.js"
  },
  "type": "module",
  "dependencies": {
    "commander": "^12.0.0",
    "ora": "^8.0.0",
    "picocolors": "^1.0.0",
    "fs-extra": "^11.0.0",
    "@inquirer/prompts": "^5.0.0"
  }
}
```

---

## packages/tokens

```
packages/tokens/
├── base.css              ← global CSS custom properties (Liquid syntax)
├── base-static.css       ← same but with hardcoded defaults (non-Liquid env)
└── package.json
```

---

## components/

Every component follows this exact structure, no exceptions:

```
components/
└── cart-drawer/
    ├── SCHEMA.md                 ← schema file, this is what the docs use to create the UI to preview
    ├── registry.json             ← component metadata for CLI
    ├── README.md                 ← usage, prerequisites, manual steps
    ├── preview.png               ← screenshot for docs site (800x600)
    ├── sections/
    │   └── lk-cart-drawer.liquid
    ├── snippets/
    │   ├── lk-cart-line-item.liquid
    │   └── lk-cart-empty.liquid
    ├── assets/
    │   ├── lk-cart-drawer.js
    │   └── lk-cart-drawer.css
    └── locales/
        └── en.default.schema.json
```

**Rules:**
- `sections/` — one file per component, always. Split UI into `snippets/`.
- `snippets/` — sub-templates only. Rendered via `{% render %}` from the section.
- `assets/` — one `.js` file and one `.css` file per component. No exceptions.
- `locales/` — delta only. Contains just the keys this component adds, not the full locale file.

### component registry.json

```json
{
  "name": "cart-drawer",
  "version": "1.0.0",
  "description": "AJAX cart drawer with line item controls",
  "tier": "free",
  "dependencies": [],
  "files": [
    { "src": "sections/lk-cart-drawer.liquid", "dest": "sections/lk-cart-drawer.liquid" },
    { "src": "snippets/lk-cart-line-item.liquid", "dest": "snippets/lk-cart-line-item.liquid" },
    { "src": "snippets/lk-cart-empty.liquid", "dest": "snippets/lk-cart-empty.liquid" },
    { "src": "assets/lk-cart-drawer.js", "dest": "assets/lk-cart-drawer.js" },
    { "src": "assets/lk-cart-drawer.css", "dest": "assets/lk-cart-drawer.css" }
  ],
  "manualSteps": [
    "Add {% render 'lk-cart-drawer' %} before </body> in layout/theme.liquid",
    "Merge locales/en.default.schema.json keys into your theme's locale files"
  ]
}
```

`dependencies` lists other LiquidKit components this one requires. CLI installs them automatically.

---

## registry.json (root)

Master manifest. CLI fetches this first.

```json
{
  "version": "1",
  "baseUrl": "https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/components",
  "components": {
    "cart-drawer": {
      "path": "cart-drawer",
      "version": "1.0.0",
      "tier": "free",
      "description": "AJAX cart drawer with line item controls"
    },
    "variant-picker": {
      "path": "variant-picker",
      "version": "1.0.0",
      "tier": "free",
      "description": "Color swatches, pills, and select variant picker"
    }
  }
}
```

The CLI resolves component files as:
```
{baseUrl}/{path}/registry.json
{baseUrl}/{path}/sections/lk-{name}.liquid
```

---

## docs/

```
docs/
├── app/
│   ├── page.tsx                  ← landing page
│   ├── components/
│   │   └── [slug]/
│   │       └── page.tsx          ← component detail page
│   └── layout.tsx
├── components/
│   ├── ComponentPreview.tsx      ← renders preview.png + install command
│   ├── FileTree.tsx
│   └── CopyButton.tsx
└── package.json
```

---

## .github/workflows/

```
.github/workflows/
├── publish.yml       ← triggers on release tag, runs npm publish for packages/cli
└── validate.yml      ← triggers on PR, validates registry.json schema
```

### validate.yml purpose

On every PR that touches `components/` or `registry.json`:
- Validates `registry.json` against schema
- Checks every component listed in `registry.json` has a matching folder
- Checks every file listed in a component's `registry.json` exists on disk