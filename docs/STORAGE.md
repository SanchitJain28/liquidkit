# Storage

LiquidKit uses three storage mechanisms. Each has a specific purpose — don't cross them.

---

## Overview

| Mechanism | Used for | Scope | Persists |
|---|---|---|---|
| `localStorage` | Client-side persistence | Browser | Until cleared |
| Shopify Cart API | Cart state | Server | Until checkout |
| Liquid + `settings.*` | Theme config / tokens | Server render | Until changed |

---

## 1. localStorage

All keys prefixed with `lk_` to avoid collisions.

### Keys

| Key | Type | Component | Purpose |
|---|---|---|---|
| `lk_recently_viewed` | `number[]` | recently-viewed | Product IDs, max 10, FIFO |
| `lk_age_verified` | `boolean` | age-verifier | Skip modal on return |
| `lk_cookie_accepted` | `boolean` | cookie-banner | Hide banner on return |

### Rules

- Always wrap in `try/catch` — localStorage throws in private browsing on some browsers
- Store only primitive values or flat arrays — no nested objects
- Never store cart data, prices, or anything that must be accurate — use Cart API

```js
// Standard read/write pattern for all components
function lkStorage(key) {
  return {
    get() {
      try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
    },
    set(value) {
      try { localStorage.setItem(key, JSON.stringify(value)) } catch { }
    },
    remove() {
      try { localStorage.removeItem(key) } catch { }
    }
  }
}

const recentlyViewed = lkStorage('lk_recently_viewed')
```

### Recently Viewed — specific logic

Max 10 items. Current product always moves to front. No duplicates.

```js
function addRecentlyViewed(productId) {
  const store = lkStorage('lk_recently_viewed')
  const ids = store.get() || []
  const updated = [productId, ...ids.filter(id => id !== productId)].slice(0, 10)
  store.set(updated)
}
```

---

## 2. Shopify Cart API

Source of truth for all cart state. Never cache cart data in localStorage or component state longer than a single render cycle.

### Endpoints used

| Endpoint | Method | Used by |
|---|---|---|
| `/cart.js` | GET | Cart drawer — fetch current cart |
| `/cart/add.js` | POST | ATC button |
| `/cart/change.js` | POST | Quantity stepper, line item remove |
| `/cart/update.js` | POST | Bulk quantity update |

### Standard fetch wrapper

```js
async function lkCartFetch(endpoint, body = null) {
  const options = {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`Cart error: ${res.status}`)
  return res.json()
}
```

### Cart state flow

```
User action
    → POST to Cart API
    → On success: fire lk:cart:updated with { cart } payload
    → Cart drawer listens → re-renders from payload
```

Never re-fetch `/cart.js` after a mutation — the mutation response **is** the updated cart. Use it directly.

```js
// Wrong — unnecessary second request
await fetch('/cart/add.js', { ... })
const cart = await fetch('/cart.js').then(r => r.json())

// Correct — response from add is the updated cart
const cart = await fetch('/cart/add.js', { ... }).then(r => r.json())
window.dispatchEvent(new CustomEvent('lk:cart:updated', { detail: { cart } }))
```

---

## 3. Liquid Settings (`settings.*`)

Used only for design tokens and component configuration. Read at render time, output into `lk-tokens.css.liquid` and section HTML.

Never use `settings.*` for runtime state — it's server-rendered, not reactive.

```liquid
{{ 'lk-tokens.css.liquid' | asset_url | stylesheet_tag }}
```

---

## What Goes Where — Decision Rules

```
Is it cart data?
  → Cart API. Always.

Does it need to persist across sessions in the browser?
  → localStorage. Only if it's non-critical UI state.

Is it a design token or component config set by the merchant?
  → settings.* + lk-tokens.css.liquid.

Is it temporary UI state (open/closed, loading, error)?
  → Component attribute or class. Not stored anywhere.
```