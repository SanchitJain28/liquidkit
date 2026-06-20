# CLI Overview

How `npx liquidkit add <component>` works — from the user's first command to files landing in their Shopify theme.

---

## User Flow (End-to-End)

```
User runs:
  npx liquidkit add announcement-bar

                │
                ▼
  1. CLI boots (bin/cli.js)
                │
                ▼
  2. Command parsed (Commander.js)
     → src/commands/add.js
                │
                ▼
  3. Fetch root registry.json from GitHub
     → src/utils/registry.js
                │
  Component found?  ─── No ──► Error: "Component not found. Run `liquidkit list`."
                │
               Yes
                │
                ▼
  4. Fetch component's registry.json
     → resolves individual file metadata + manualSteps
                │
                ▼
  5. Check for dependency components
     → install each dependency first (recursive)
                │
                ▼
  6. For each file in component:
       Conflict check (src/utils/conflict.js)
         ├── File doesn't exist → download and write
         ├── File exists, same content → skip
         └── File exists, different → prompt: [s]kip / [o]verwrite / [r]ename
                │
                ▼
  7. Download + write component source files to theme
     → src/utils/installer.js
     → applies --prefix substitution if set
                │
                ▼
  8. First install? → Write assets/lk-tokens.css.liquid
     → only written once; skipped if already present
                │
                ▼
  9. Merge config/settings_schema.json  (AUTOMATED)
     → append "LiquidKit" group if not already present
     → allows merchant to configure global tokens in theme editor
                │
                ▼
  10. Merge locales/en.default.schema.json  (AUTOMATED)
      → deep-merge component strings under liquid_components.{slug}
      → additive only, never overwrites existing keys
                │
                ▼
  11. Print manual steps  (only for things that CANNOT be automated)
      → e.g. "Add {% render 'lk-announcement-bar' %} before </body> in layout/theme.liquid"
                │
                ▼
  Done ✓
```

---

## The Core Rule: Structured JSON vs Free-Form Files

This determines whether a file modification is automated or left as a manual step:

| File                             | Format                | Auto-modified?  | Reason                       |
| -------------------------------- | --------------------- | --------------- | ---------------------------- |
| `assets/lk-{component}.css`      | plain text (new file) | ✅ Written      | New file, no merge needed    |
| `assets/lk-{component}.js`       | plain text (new file) | ✅ Written      | New file, no merge needed    |
| `sections/lk-{component}.liquid` | plain text (new file) | ✅ Written      | New file, no merge needed    |
| `assets/lk-tokens.css.liquid`    | plain text (new file) | ✅ Written once | New file on first install    |
| `config/settings_schema.json`    | **JSON array**        | ✅ Auto-merged  | Structured, additive append  |
| `locales/en.default.schema.json` | **JSON object**       | ✅ Auto-merged  | Structured, namespaced merge |
| `layout/theme.liquid`            | free-form Liquid/HTML | ❌ Manual step  | Structure varies per theme   |

Free-form text files like `theme.liquid` require the developer to know _where_ to place a render tag — before `</body>`, after `<header>`, inside a conditional — and the right location is entirely theme-specific. Automating this would break themes. JSON files have predictable structure and can be safely programmatically updated.

---

## What Files Change in the User's Shopify Theme

### Typical install: `npx liquidkit add announcement-bar`

```
your-shopify-theme/
├── sections/
│   └── lk-announcement-bar.liquid         ← WRITTEN (new file)
├── assets/
│   ├── lk-announcement-bar.js             ← WRITTEN (new file)
│   └── lk-announcement-bar.css            ← WRITTEN (new file)
├── config/
│   └── settings_schema.json               ← AUTO-MERGED (LiquidKit group appended)
├── locales/
│   └── en.default.schema.json             ← AUTO-MERGED (liquid_components.announcement_bar added)
└── layout/
    └── theme.liquid                       ← NOT TOUCHED (manual step printed)
```

### First-time install only (tokens bootstrap)

The very first time _any_ LiquidKit component is installed, the CLI also writes the global token stylesheet and appends global token settings:

```
your-shopify-theme/
├── assets/
│   └── lk-tokens.css.liquid               ← WRITTEN once, skipped on subsequent installs
└── config/
    └── settings_schema.json               ← "LiquidKit" group appended (once)
```

`lk-tokens.css.liquid` maps Shopify `settings.*` values to LiquidKit CSS custom properties. Referencing it in `layout/theme.liquid` is the one unavoidable manual step.

---

## Manual Steps — What the User Must Do Themselves

After the CLI finishes, it prints **only the steps that truly cannot be automated** — specifically anything requiring edits to free-form Liquid/HTML files.

Example terminal output after installing `announcement-bar`:

```
✔  3 files written
✔  config/settings_schema.json updated
✔  locales/en.default.schema.json updated

  1 manual step required:

  layout/theme.liquid — add before </body>:
    {% render 'lk-announcement-bar' %}

  If this is your first LiquidKit component, also add inside <head>:
    {{ 'lk-tokens.css.liquid' | asset_url | stylesheet_tag }}
```

> [!IMPORTANT]
> The `manualSteps` array in each component's `registry.json` drives this output. It should only contain steps that require free-form file edits — not JSON merges, which are handled automatically.

---

## Data Flow: How the CLI Resolves Files

All component data is hosted on GitHub. No server required.

```
Root registry (fetched first):
  https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/registry.json

  → contains list of all components + their paths

Component registry (fetched per component):
  https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/components/{slug}/registry.json

  → contains file list, manualSteps, dependencies, version

Each component file (fetched per file):
  https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/components/{slug}/sections/lk-{slug}.liquid
  https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/components/{slug}/assets/lk-{slug}.js
  https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/components/{slug}/assets/lk-{slug}.css
```

The file destination on the user's machine is defined by the `dest` field in each file entry:

```json
{
  "src": "announcement-bar/sections/lk-announcement-bar.liquid",
  "dest": "sections/lk-announcement-bar.liquid"
}
```

`src` → path relative to GitHub `components/` directory  
`dest` → path relative to the user's Shopify theme root

---

## CLI Commands

| Command                            | Description                                                  |
| ---------------------------------- | ------------------------------------------------------------ |
| `npx liquidkit add <component>`    | Install a component into the current theme directory         |
| `npx liquidkit list`               | List all available components with tier and description      |
| `npx liquidkit info <component>`   | Show files, dependencies, and manual steps before installing |
| `npx liquidkit update <component>` | Re-download latest version of a component                    |

### Flags for `add`

| Flag                | Description                                    | Example               |
| ------------------- | ---------------------------------------------- | --------------------- |
| `--prefix <prefix>` | Override the default `lk-` namespace           | `--prefix my-`        |
| `--dir <path>`      | Theme root path (default: `./`)                | `--dir ./themes/dawn` |
| `--dry-run`         | Show what would be written without writing     |                       |
| `--force`           | Overwrite all existing files without prompting |                       |

---

## Source File Map

```
packages/cli/
├── bin/
│   └── cli.js                ← Entry point. Bootstraps Commander, registers all commands.
│
└── src/
    ├── commands/
    │   ├── add.js            ← Orchestrates the full install flow (steps 3–8 above)
    │   ├── list.js           ← Fetches registry.json, formats component list for terminal
    │   ├── info.js           ← Fetches component registry.json, prints files + manual steps
    │   └── update.js         ← Re-runs install with --force on an existing component
    │
    └── utils/
        ├── registry.js       ← fetch() wrappers for root registry.json and component registry.json
        ├── installer.js      ← Downloads file content, applies prefix substitution, writes to disk
        ├── conflict.js       ← Checks if file exists + compares content, prompts user on conflict
        └── prompt.js         ← All @inquirer/prompts UI: conflict resolution, confirmations
```

---

## JSON Merge Strategy

### `config/settings_schema.json` — Append LiquidKit Group

This file is a JSON array of theme setting groups. On first install, the CLI appends one group:

```json
{
  "name": "LiquidKit",
  "settings": [
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color",
      "id": "lk_color_primary",
      "label": "Primary color",
      "default": "#000000"
    },
    {
      "type": "color",
      "id": "lk_color_bg",
      "label": "Background color",
      "default": "#ffffff"
    },
    {
      "type": "color",
      "id": "lk_color_text",
      "label": "Text color",
      "default": "#000000"
    }
  ]
}
```

These settings power `lk-tokens.css.liquid` — the merchant configures global tokens directly from the Shopify Theme Editor, no code edits needed.

**Merge logic:**

1. Read + JSON.parse `config/settings_schema.json`
2. Check if any group already has `"name": "LiquidKit"`
3. If not → push the group
4. JSON.stringify + write back

### `locales/en.default.schema.json` — Deep Merge Component Strings

This file is a JSON object. Component locale strings live under the `liquid_components` key — a namespace LiquidKit owns entirely.

Per component install, the CLI merges the component's locale object:

```json
{
  "liquid_components": {
    "announcement_bar": {
      "name": "Announcement Bar",
      "dismiss": "Dismiss announcement",
      "settings": {
        "autoplay": { "label": "Autoplay" },
        "autoplay_speed": { "label": "Autoplay speed" }
      }
    }
  }
}
```

**Merge logic:**

1. Read + JSON.parse `locales/en.default.schema.json`
2. Deep-merge `liquid_components.{slug}` into the parsed object (existing keys untouched)
3. JSON.stringify + write back

Because we never touch keys outside `liquid_components.*`, this is safe even on themes that already have complex locale files.

---

## Implementation Checklist

Files that need to be implemented (currently empty):

- [ ] `bin/cli.js` — bootstrap Commander, register `add`, `list`, `info`, `update`
- [ ] `src/commands/add.js` — core install orchestration
- [ ] `src/commands/list.js` — fetch + display component list
- [ ] `src/commands/info.js` — fetch + display component details
- [ ] `src/commands/update.js` — re-install with overwrite
- [ ] `src/utils/registry.js` — `fetchRegistry()`, `fetchComponentMeta(slug)`
- [ ] `src/utils/installer.js` — `downloadFile(url)`, `writeThemeFile(dest, content, prefix)`
- [ ] `src/utils/conflict.js` — `checkConflict(dest, newContent)` → `{ status: 'new' | 'same' | 'conflict' }`
- [ ] `src/utils/prompt.js` — `promptConflictResolution(filename)` → `'skip' | 'overwrite' | 'rename'`
- [ ] `src/utils/merger.js` — `mergeSettingsSchema(themeDir, group)`, `mergeLocales(themeDir, slug, strings)`

---

## Prefix Substitution

When `--prefix my-` is passed, the installer replaces every occurrence of `lk-` in all file content and filenames before writing to disk.

Affects:

- File names: `lk-announcement-bar.liquid` → `my-announcement-bar.liquid`
- CSS classes: `.lk-announcement-bar` → `.my-announcement-bar`
- CSS tokens: `--lk-color-primary` → `--my-color-primary`
- Web component tags: `<lk-announcement-bar>` → `<my-announcement-bar>`
- JS events: `lk:cart:updated` → `my:cart:updated`
- `customElements.define('lk-...')` → `customElements.define('my-...')`

Substitution is a simple global string replace on file content. Component source files always use `lk-` — the prefix is never baked into source.

---

## Dependency Resolution

Components can declare dependencies on other LiquidKit components via the `dependencies` field in their `registry.json`:

```json
{
  "name": "sticky-atc",
  "dependencies": ["add-to-cart", "variant-picker"]
}
```

The CLI resolves dependencies **before** installing the requested component. Order:

1. Recursively fetch dependency metadata
2. Detect if dependency is already installed (check if dest file exists)
3. Install missing dependencies first
4. Install the requested component last

Circular dependency detection: track visited slugs during recursion, error if a cycle is found.

---

## Key Design Decisions

**No config file written to the theme.**  
The CLI does not write a `liquidkit.json` or `.liquidkitrc` to the theme. There is no lock file. Components are standalone — the source of truth is always GitHub.

**Structured JSON = automated. Free-form Liquid = manual.**  
`config/settings_schema.json` and `locales/en.default.schema.json` are well-structured JSON — the CLI merges them safely. `layout/theme.liquid` is free-form HTML/Liquid where the correct insertion point varies per theme — the CLI prints instructions instead.

**Idempotent installs.**  
Running `liquidkit add announcement-bar` twice is safe. File writes skip if content is identical. JSON merges check before appending — a `liquid_components.announcement_bar` key already present is left untouched. A `"name": "LiquidKit"` settings group already present is not duplicated.

**`liquid_components.*` is a reserved namespace.**  
All LiquidKit locale strings live under `liquid_components` in `en.default.schema.json`. This is a documented convention so theme developers know not to add their own keys there.
v
**npx-first.**  
The CLI is designed to be used without a global install: `npx liquidkit add ...`. Publishing to npm as `liquidkit` (the package name) makes this work.
