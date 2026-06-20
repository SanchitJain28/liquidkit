# Schema Convention

Every component has one `SCHEMA.json` file. It is the single source of truth for:

1. The actual `{% schema %}` block in the component's `.liquid` file
2. Mock data used by `liquidjs` to render the static docs preview
3. The interactive settings panel on the docs site (sliders, checkboxes, color pickers that live-update the preview)

Write `SCHEMA.json` before writing any `.liquid`, `.js`, or `.css` file. The component is built from this file, not the other way around.

---

## File Location

```
components/{component-name}/SCHEMA.json
```

---

## Top-Level Structure

```json
{
  "component": "string — must match folder name",
  "section_settings": [],
  "blocks": [],
  "preview_data": {}
}
```

| Key | Required | Purpose |
|---|---|---|
| `component` | yes | Must exactly match the component folder name (kebab-case) |
| `section_settings` | yes | Array, can be empty `[]` if component has no section-level settings |
| `blocks` | no | Omit entirely if component doesn't use blocks |
| `preview_data` | yes | Mock values for every setting — used by preview renderer |

---

## `section_settings` — Setting Object

Every setting object uses this shape:

```json
{
  "id": "snake_case_id",
  "type": "shopify_setting_type",
  "default": "value matching type",
  "label": "Human readable label",
  "description": "One sentence — shown as help text"
}
```

### Required fields (always)

| Field | Rule |
|---|---|
| `id` | `snake_case`, matches the Liquid `settings.{id}` reference exactly |
| `type` | Must be a valid Shopify schema type — see table below |
| `label` | Sentence case, no period |
| `description` | One sentence, no period at end, explains *why* not just *what* |

### Type-specific required fields

| Type | Additional required fields |
|---|---|
| `range` | `min`, `max`, `step`, `unit` (use `""` if no unit) |
| `select` | `options: [{ "value": "...", "label": "..." }]` |
| `color` | `default` is `null` if it inherits a global token, otherwise a hex string |
| `checkbox` | `default` must be `true` or `false` |
| `text` / `richtext` | `default` is a string, `""` allowed |
| `url` | `default` is always `""` |
| `image_picker` | no `default` key at all — Shopify doesn't support defaults for this type |

### Valid `type` values

```
checkbox, text, textarea, richtext, number, range,
select, radio, color, color_background, font_picker,
url, image_picker, video, product, collection, blog, page, link_list
```

If a type isn't in this list, it's not a real Shopify setting type — check the Shopify theme docs before using it.

---

## Color Settings — Token Fallback Rule

Any `color` setting that should default to a global design token (not a hardcoded hex) must use `fallback_token` instead of a literal default:

```json
{
  "id": "bg_color",
  "type": "color",
  "default": null,
  "fallback_token": "--lk-color-primary",
  "label": "Background color",
  "description": "Block background color"
}
```

Rule: if `default` is `null`, `fallback_token` is required. If `default` is a hex string, omit `fallback_token`.

This tells the docs UI to render "Inherits from `--lk-color-primary`" instead of a pre-filled color swatch, and tells the component CSS to fall back to the token when the merchant hasn't picked a color:

```css
background-color: var(--lk-announcement-slide-bg, var(--lk-color-primary));
```

---

## `blocks` — Block Object

Use only if the component supports repeatable blocks (carousels, line items, accordion items, etc).

```json
{
  "blocks": [
    {
      "type": "snake_case_block_type",
      "settings": [
        // same setting object shape as section_settings
      ]
    }
  ]
}
```

Rules:
- `type` is `snake_case`, becomes the Liquid `block.type` value
- A component can define multiple block types (e.g. `accordion` could have `text_block` and `image_block`)
- Each block's `settings` array follows the exact same setting object rules as `section_settings`

If the component has no blocks, omit the `blocks` key entirely — don't include `"blocks": []`.

---

## `preview_data` — Mock Values

Every setting defined above must have a corresponding mock value here. This is what `liquidjs` renders and what the docs page shows by default.

```json
{
  "preview_data": {
    "section_settings": {
      "autoplay": true,
      "autoplay_speed": 4
    },
    "blocks": [
      {
        "id": "block-1",
        "type": "announcement",
        "settings": {
          "message": "Free shipping on orders over $50",
          "bg_color": "#000000"
        }
      }
    ]
  }
}
```

Rules:
- `section_settings` here is a flat key-value map — `id: value`, not the full setting object
- If the component has `blocks`, `preview_data.blocks` must include at least 2 block instances (so carousels, lists, and repeatable UI render meaningfully — 1 block never shows real behavior)
- Every block instance needs a unique `id` field (`block-1`, `block-2`) — mimics Shopify's real block ID
- Color values in `preview_data` are always literal hex strings, even if the real setting has `fallback_token` — the preview needs something concrete to render

---

## Naming Rules Recap

| Thing | Case | Example |
|---|---|---|
| `component` value | kebab-case | `announcement-bar` |
| Setting `id` | snake_case | `autoplay_speed` |
| Block `type` | snake_case | `announcement` |
| `label` | Sentence case | `Autoplay speed` |
| `description` | Sentence, no trailing period | `Seconds per slide` |

---

## Validation Checklist

Before considering `SCHEMA.json` done:

- [ ] `component` matches folder name exactly
- [ ] Every setting has `id`, `type`, `default`, `label`, `description`
- [ ] Every `range` has `min`, `max`, `step`, `unit`
- [ ] Every `select` has `options` array
- [ ] Every `color` with `default: null` has a `fallback_token`
- [ ] `preview_data` has a value for every single setting — no gaps
- [ ] If `blocks` exists, `preview_data.blocks` has 2+ instances
- [ ] File is valid JSON — run it through a linter, don't eyeball it

---

## Minimal Example — No Blocks

```json
{
  "component": "sticky-atc",
  "section_settings": [
    {
      "id": "show_on_mobile",
      "type": "checkbox",
      "default": true,
      "label": "Show on mobile",
      "description": "Display sticky bar on mobile devices"
    },
    {
      "id": "trigger_offset",
      "type": "range",
      "min": 0,
      "max": 100,
      "step": 10,
      "unit": "%",
      "default": 50,
      "label": "Trigger offset",
      "description": "Scroll percentage before bar appears"
    }
  ],
  "preview_data": {
    "section_settings": {
      "show_on_mobile": true,
      "trigger_offset": 50
    }
  }
}
```

---

## How This File Is Used Downstream

```
SCHEMA.json
    ├──→ {% schema %} block in lk-{component}.liquid   (manual — copy structure, Shopify syntax)
    ├──→ scripts/render-preview.js                       (automatic — feeds liquidjs)
    └──→ docs site settings panel                        (automatic — generates form controls)
```

Changing `SCHEMA.json` after the component is built means updating the `{% schema %}` block to match by hand — they are not auto-synced. Treat `SCHEMA.json` as the spec you write first, then keep both in sync manually.