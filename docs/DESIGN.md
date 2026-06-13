# LiquidKit Design System

Every component must follow this doc. No exceptions.

---

## Design Philosophy

- **Invisible by default** — components have no strong visual opinion. They inherit the theme's look via CSS tokens.
- **Overridable at every level** — global tokens → component tokens → inline schema settings.
- **Functional first** — layout and spacing are opinionated. Color and typography are not.

---

## Token Layers

```
Theme Settings (Shopify)
        ↓
Global Tokens (--lk-*)         ← tokens/base.css
        ↓
Component Tokens (--lk-{c}-*)  ← assets/lk-{component}.css
        ↓
Schema Overrides               ← merchant edits in theme editor
```

Never hardcode a color, font, or spacing value in a component. Always use a token with a fallback.

```css
/* Wrong */
background: #000;
font-family: sans-serif;
padding: 16px;

/* Correct */
background: var(--lk-color-primary, #000000);
font-family: var(--lk-font-family, sans-serif);
padding: var(--lk-spacing-md, 1rem);
```

---

## Global Token Reference

### Colors
```css
--lk-color-primary        /* main action color — buttons, links */
--lk-color-primary-text   /* text on primary color */
--lk-color-bg             /* page background */
--lk-color-bg-secondary   /* subtle surface — drawers, cards */
--lk-color-text           /* body text */
--lk-color-text-muted     /* secondary text, labels */
--lk-color-border         /* dividers, input borders */
--lk-color-error          /* error states */
--lk-color-success        /* success states */
--lk-color-overlay        /* backdrop overlays */
```

### Typography
```css
--lk-font-family          /* body font */
--lk-font-family-heading  /* heading font */
--lk-font-size-xs         /* 0.75rem */
--lk-font-size-sm         /* 0.875rem */
--lk-font-size-base       /* 1rem */
--lk-font-size-lg         /* 1.125rem */
--lk-font-size-xl         /* 1.25rem */
--lk-font-weight-normal   /* 400 */
--lk-font-weight-medium   /* 500 */
--lk-font-weight-bold     /* 700 */
--lk-line-height-base     /* 1.5 */
--lk-line-height-tight    /* 1.25 */
```

### Spacing
```css
--lk-space-1   /* 0.25rem /  4px */
--lk-space-2   /* 0.5rem  /  8px */
--lk-space-3   /* 0.75rem / 12px */
--lk-space-4   /* 1rem    / 16px */
--lk-space-5   /* 1.25rem / 20px */
--lk-space-6   /* 1.5rem  / 24px */
--lk-space-8   /* 2rem    / 32px */
--lk-space-10  /* 2.5rem  / 40px */
--lk-space-12  /* 3rem    / 48px */
--lk-space-16  /* 4rem    / 64px */
```

### Shape
```css
--lk-radius-sm    /* 2px */
--lk-radius-md    /* 4px */
--lk-radius-lg    /* 8px */
--lk-radius-xl    /* 12px */
--lk-radius-full  /* 9999px */
```

### Motion
```css
--lk-duration-fast    /* 150ms */
--lk-duration-base    /* 250ms */
--lk-duration-slow    /* 400ms */
--lk-ease-default     /* cubic-bezier(0.4, 0, 0.2, 1) */
--lk-ease-in          /* cubic-bezier(0.4, 0, 1, 1) */
--lk-ease-out         /* cubic-bezier(0, 0, 0.2, 1) */
```

### Z-index
```css
--lk-z-drawer    /* 500  */
--lk-z-modal     /* 600  */
--lk-z-overlay   /* 490  */
--lk-z-sticky    /* 400  */
--lk-z-dropdown  /* 300  */
--lk-z-tooltip   /* 700  */
```

---

## Animation Rules

Use CSS transitions and `@keyframes` only. No JS animation libraries.

**What gets animated:**
- Drawers: `transform: translateX()` + `opacity`
- Modals: `transform: scale()` + `opacity`
- Overlays: `opacity` only
- Accordions: `grid-template-rows: 0fr → 1fr` (no max-height hacks)
- Sticky bars: `transform: translateY()`

**Rules:**
- Always animate `transform` and `opacity` — GPU composited, never causes reflow.
- Never animate `height`, `width`, `top`, `left`, `margin`, or `padding`.
- Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .lk-cart-drawer {
    transition: none;
  }
}
```

---

## Component CSS Structure

Every CSS file must follow this section order:

```css
/* 1. Component tokens */
:root {
  --lk-{component}-token: value;
}

/* 2. Base styles */
.lk-{component} { }

/* 3. Elements */
.lk-{component}__{element} { }

/* 4. Modifiers */
.lk-{component}--{modifier} { }

/* 5. States */
.lk-{component}:hover { }
.lk-{component}:focus-visible { }
.lk-{component}[aria-disabled="true"] { }

/* 6. Responsive */
@media (max-width: 768px) { }

/* 7. Reduced motion */
@media (prefers-reduced-motion: reduce) { }
```

---

## Accessibility Requirements

Every component must meet these. Non-negotiable.

**Focus**
- All interactive elements reachable via keyboard
- Focus ring always visible — never `outline: none` without a replacement
- Use `:focus-visible` not `:focus`

```css
.lk-button:focus-visible {
  outline: 2px solid var(--lk-color-primary);
  outline-offset: 2px;
}
```

**ARIA**
- Drawers: `role="dialog"` + `aria-modal="true"` + `aria-label`
- Buttons that toggle: `aria-expanded`
- Loading states: `aria-busy="true"`
- Disabled states: `aria-disabled="true"` (not `disabled` attr — keeps focusable)
- Dynamic content updates: `aria-live="polite"`

**Modals / Drawers**
- Trap focus inside when open
- Return focus to trigger element on close
- Close on `Escape` key

---

## Web Component Structure

Every JS file must follow this structure:

```js
class ComponentName extends HTMLElement {
  // 1. Observed attributes
  static get observedAttributes() {
    return ['open', 'loading']
  }

  // 2. Constructor — only attach shadow or set initial state
  constructor() {
    super()
    this._handleOpen = this._handleOpen.bind(this)
  }

  // 3. connectedCallback — attach listeners, fetch initial data
  connectedCallback() {
    window.addEventListener('lk:drawer:open', this._handleOpen)
  }

  // 4. disconnectedCallback — always clean up
  disconnectedCallback() {
    window.removeEventListener('lk:drawer:open', this._handleOpen)
  }

  // 5. attributeChangedCallback
  attributeChangedCallback(name, oldVal, newVal) { }

  // 6. Private methods prefixed with _
  _handleOpen(e) { }
  _render() { }

  // 7. Public methods (called externally if needed)
  open() { }
  close() { }
}

customElements.define('lk-component-name', ComponentName)
```

**Rules:**
- Always clean up event listeners in `disconnectedCallback`
- Bind handlers in constructor, not inline
- Private methods prefixed with `_`
- Never use `innerHTML` with user data — XSS risk. Use `textContent` or `createElement`.

---

## Liquid Section Structure

Every section file must follow this order:

```liquid
{% comment %} ─────────────────────────────────────────
  LiquidKit — lk-{component}
  Docs: https://liquidkit.dev/components/{component}
{% endcomment %}

{{ 'lk-{component}.css' | asset_url | stylesheet_tag }}

<lk-{component}
  class="lk-{component}"
  data-option="{{ section.settings.option }}"
>
  {%- render 'lk-{component}-{part}' -%}
</lk-{component}>

<script src="{{ 'lk-{component}.js' | asset_url }}" defer></script>

{% schema %}
{
  "name": "LK {Component Name}",
  "settings": [
    {
      "type": "header",
      "content": "Content"
    }
  ],
  "presets": [
    {
      "name": "LK {Component Name}"
    }
  ]
}
{% endschema %}
```

**Rules:**
- CSS loaded at top of section, not in `<head>`
- JS loaded at bottom with `defer`
- Data passed from Liquid to JS via `data-*` attributes on the web component element
- Never use `<script>` inline in sections for logic — only `<script src>` pointing to asset

---

## Passing Data: Liquid → JS

Use `data-*` attributes. Never inline JSON in script tags.

```liquid
<lk-variant-picker
  data-product-id="{{ product.id }}"
  data-product-url="{{ product.url }}"
  data-available="{{ product.available }}"
>
```

```js
connectedCallback() {
  this.productId = this.dataset.productId
  this.productUrl = this.dataset.productUrl
}
```

For complex data (variants array, media list), use a single `data-json` attribute:

```liquid
<lk-variant-picker
  data-variants="{{ product.variants | json | escape }}"
>
```

```js
this.variants = JSON.parse(this.dataset.variants)
```

---

## Error & Loading States

Every component that makes a network request must handle all three states:

| State | Class | ARIA |
|---|---|---|
| Loading | `.lk-{component}--loading` | `aria-busy="true"` |
| Error | `.lk-{component}--error` | `aria-live="assertive"` |
| Success | (default) | `aria-busy="false"` |

Error messages go into a dedicated element, not appended dynamically:

```html
<div class="lk-cart-drawer__error" aria-live="assertive" hidden>
  Something went wrong. Please try again.
</div>
```

Show/hide with `hidden` attribute, not `display: none`.

---

## Schema Settings Convention

Group settings with headers. Always in this order:

```json
"settings": [
  { "type": "header", "content": "Content" },
  // text, richtext, image settings

  { "type": "header", "content": "Behaviour" },
  // toggles, selects for behaviour

  { "type": "header", "content": "Style" },
  // color pickers, font pickers, spacing sliders

  { "type": "header", "content": "Advanced" }
  // anything that breaks layout if misconfigured
]
```

---

## Component README Template

Every component README must include:

```md
# lk-{component}

One line description.

## Files installed
- sections/lk-{component}.liquid
- assets/lk-{component}.js
- assets/lk-{component}.css

## Manual steps
1. Step one
2. Step two

## CSS tokens
| Token | Default | Description |
|---|---|---|
| --lk-drawer-width | 420px | Width of the drawer panel |

## Events
| Event | Direction | Payload |
|---|---|---|
| lk:cart:updated | fires | { cart } |
| lk:drawer:open | listens | — |

## Browser support
All modern browsers. No IE.
```