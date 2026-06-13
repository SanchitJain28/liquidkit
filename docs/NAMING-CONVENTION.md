# Naming Conventions

Default prefix: `lk-`
Overridable at install time via `--prefix <your-prefix>`

All conventions below use `lk-` as the default. If a custom prefix is provided, every occurrence of `lk-` is replaced during install.

---

## Files

| Type | Pattern | Example |
|---|---|---|
| Section | `lk-{component}.liquid` | `lk-cart-drawer.liquid` |
| Snippet | `lk-{component}-{part}.liquid` | `lk-cart-line-item.liquid` |
| JS asset | `lk-{component}.js` | `lk-cart-drawer.js` |
| CSS asset | `lk-{component}.css` | `lk-cart-drawer.css` |
| Component folder | `{component}` (kebab-case) | `cart-drawer/` |

---

## CSS Classes

BEM with `lk-` prefix.

```
.lk-{component}                   block
.lk-{component}__{element}        element
.lk-{component}--{modifier}       modifier
```

Examples:
```css
.lk-cart-drawer
.lk-cart-drawer__header
.lk-cart-drawer__item
.lk-cart-drawer__item--removing
.lk-cart-drawer--open
```

**Never use** bare class names like `.drawer`, `.cart`, `.open` — always prefix.

---

## CSS Custom Properties

```
--lk-{scope}-{property}
```

Global tokens (no component scope):
```css
--lk-color-primary
--lk-color-bg
--lk-color-text
--lk-color-border
--lk-font-family
--lk-font-size-base
--lk-border-radius
--lk-spacing-unit
```

Component-scoped tokens:
```css
--lk-drawer-width
--lk-drawer-bg
--lk-drawer-z-index
--lk-swatch-size
--lk-swatch-border-radius
```

All component tokens must fall back to a global token or a hardcoded safe default:
```css
--lk-drawer-bg: var(--lk-color-bg, #ffffff);
```

---

## Web Components (Custom Elements)

```
lk-{component}
```

Examples:
```html
<lk-cart-drawer>
<lk-variant-picker>
<lk-predictive-search>
<lk-sticky-atc>
```

Custom element class names in JS use PascalCase without prefix:
```js
class CartDrawer extends HTMLElement { }
customElements.define('lk-cart-drawer', CartDrawer)
```

---

## JS Custom Events

```
lk:{noun}:{verb}
```

Examples:
```js
lk:cart:updated
lk:cart:error
lk:variant:changed
lk:drawer:open
lk:drawer:close
lk:search:opened
lk:search:closed
```

Always dispatched on `window` so any component can listen:
```js
window.dispatchEvent(new CustomEvent('lk:cart:updated', { detail: { cart } }))
window.addEventListener('lk:cart:updated', (e) => { })
```

---

## localStorage Keys

```
lk_{component}_{data}
```

Examples:
```
lk_recently_viewed
lk_age_verified
lk_cookie_accepted
```

---

## Liquid Section Schema

Section `id` and `name` in `{% schema %}`:
```json
{
  "name": "LK Cart Drawer",
  "tag": "div",
  "class": "lk-cart-drawer-section"
}
```

Section setting IDs — plain kebab-case, no prefix needed (scoped to section):
```json
{ "id": "heading", "type": "text" }
{ "id": "show-order-note", "type": "checkbox" }
{ "id": "free-shipping-threshold", "type": "number" }
```

---

## Locale Keys

```json
{
  "liquid_components": {
    "cart": {
      "title": "Your Cart",
      "empty": "Your cart is empty",
      "checkout": "Proceed to Checkout"
    },
    "search": {
      "placeholder": "Search",
      "no_results": "No results for"
    }
  }
}
```

Always nested under `liquid_components` to avoid collision with theme locale keys.

---

## Registry & CLI

Component names in `registry.json` and CLI: `kebab-case`
```
cart-drawer
variant-picker
product-media-gallery
```

```bash
npx liquidkit add cart-drawer
npx liquidkit add variant-picker
```

---

## JavaScript Inside Liquid Files

Avoid inline `<script>` in Liquid files. All JS lives in `assets/lk-{component}.js`, loaded via:
```liquid
{{ 'lk-cart-drawer.js' | asset_url | script_tag }}
```

Or deferred:
```liquid
<script src="{{ 'lk-cart-drawer.js' | asset_url }}" defer></script>
```

---

## Summary Table

| Thing | Pattern | Example |
|---|---|---|
| Component folder | `kebab-case` | `cart-drawer` |
| Section file | `lk-{component}.liquid` | `lk-cart-drawer.liquid` |
| Snippet file | `lk-{component}-{part}.liquid` | `lk-cart-line-item.liquid` |
| JS file | `lk-{component}.js` | `lk-cart-drawer.js` |
| CSS file | `lk-{component}.css` | `lk-cart-drawer.css` |
| CSS class | `.lk-{component}__{element}` | `.lk-cart-drawer__header` |
| CSS token | `--lk-{scope}-{property}` | `--lk-drawer-width` |
| Web component tag | `lk-{component}` | `<lk-cart-drawer>` |
| JS class | `PascalCase` | `CartDrawer` |
| JS event | `lk:{noun}:{verb}` | `lk:cart:updated` |
| localStorage | `lk_{component}_{data}` | `lk_recently_viewed` |
| Locale keys | `liquid_components.{component}.{key}` | `liquid_components.cart.title` |
| CLI command arg | `kebab-case` | `liquidkit add cart-drawer` |