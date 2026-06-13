# LiquidKit

A CLI-installable, copy-paste component library for Shopify Liquid themes.

## What It Is

LiquidKit is the shadcn equivalent for Shopify Liquid. Developers run a single command to install production-ready, theme-agnostic components into any Shopify Online Store 2.0 theme.

```bash
npx liquidkit add cart-drawer
```

This copies the correct files into `sections/`, `snippets/`, `assets/`, and prints any manual steps required.

## What It Is Not

- Not a theme
- Not a Hydrogen / headless library
- Not a page builder
- Not a Shopify app

## Core Principles

**Theme-agnostic**
Components use CSS custom properties with fallbacks. They work in any OS 2.0 theme without modification. Devs override tokens to match their brand — no source edits required.

**Zero dependencies**
Vanilla JS only. No Alpine, no jQuery, no GSAP. Web Components API + `fetch` + `IntersectionObserver` + `CustomEvent` — all native browser APIs.

**Fully namespaced**
Every CSS class, web component tag, JS event, schema ID, and localStorage key is prefixed with `lk-`. No collision with any theme. Prefix is overridable at install time via `--prefix`.

**Schema-complete**
Every section ships with a full `{% schema %}` block. Merchants configure components entirely from the Shopify theme editor.

**Non-destructive install**
The CLI never auto-modifies `theme.liquid`, locale files, or any existing theme file. It prints manual steps. No surprise mutations.

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Markup | Shopify Liquid | Target environment |
| Styling | CSS custom properties | Theme-agnostic, zero build step |
| JavaScript | Vanilla Web Components | No deps, true encapsulation, all modern browsers |
| CLI | Node.js + Commander | Standard, npx-compatible |
| Registry | JSON on GitHub | No server needed, raw URLs as CDN |
| Docs | Next.js on Vercel | Fast, markdown-friendly |

## Component Tiers

**Free** — Core utility components. Drives adoption and trust.
**Paid** — Complex commerce components (bundle builder, subscription UI, B2B pricing).

## Shopify APIs Used

All stable, available on every Shopify store:

- `/cart.js` `/cart/add.js` `/cart/change.js` `/cart/update.js` — Cart AJAX
- `/search/suggest.json` — Predictive search
- `?variant=ID` — Variant URL parameter
- `collection.filters` — Storefront filtering (OS 2.0)
- `product.media` `product.variants` — Standard Liquid objects

## Inter-Component Communication

Components communicate via custom DOM events. No shared global state.

```js
// Variant picker fires this
dispatchEvent(new CustomEvent('lk:variant:changed', { detail: { variantId, variant } }))

// ATC button, gallery, price — all listen
window.addEventListener('lk:variant:changed', (e) => { ... })
```

### Event Reference

| Event | Fired by | Consumed by |
|---|---|---|
| `lk:variant:changed` | Variant Picker | ATC Button, Gallery, Price, Sticky ATC |
| `lk:cart:updated` | ATC Button, Quantity Stepper | Cart Drawer, Cart Count Badge |
| `lk:drawer:open` | Any trigger | Cart Drawer |
| `lk:drawer:close` | Cart Drawer | Any listener |

## CSS Token Architecture

Two layers:

**Global tokens** (`tokens/base.css`) — installed once, maps theme settings to LiquidKit variables:
```css
:root {
  --lk-color-primary: {{ settings.color_button }};
  --lk-font-family: {{ settings.type_body_font.family }};
  --lk-border-radius: 4px;
  --lk-spacing-unit: 1rem;
}
```

**Component tokens** — component-specific, inherit from global tokens:
```css
:root {
  --lk-drawer-width: 420px;
  --lk-drawer-bg: var(--lk-color-bg);
  --lk-drawer-z-index: 1000;
}
```

## V1 Component List

### Free (P0 — build first)
- `cart-drawer`
- `variant-picker`
- `announcement-bar`

### Free (P1)
- `product-media-gallery`
- `add-to-cart`
- `quantity-stepper`
- `sticky-atc`
- `predictive-search`
- `recently-viewed`
- `faceted-filters`
- `age-verifier`
- `cookie-banner`
- `product-card`

### Paid (P2)
- `bundle-builder`
- `subscription-selector`
- `quantity-breaks`
- `multi-step-checkout`
- `gift-message`
- `size-guide`
- `infinite-scroll`

## Development Order

1. Build `cart-drawer`, `variant-picker`, `announcement-bar` (establishes patterns)
2. Build CLI around those patterns
3. Build remaining free components
4. Launch beta
5. Build paid components