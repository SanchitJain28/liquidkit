# Component Spec

Fill this out before writing any code for a component. No exceptions.

---

## Template

Copy this for every new component.

```md
# Component: {name}

## Meta
| Field | Value |
|---|---|
| Name | cart-drawer |
| Tier | free / paid |
| Priority | P0 / P1 / P2 |
| Status | planned / in-progress / done |

## Purpose
One sentence. What does this component do for the merchant/customer?

## Files
| File | Purpose |
|---|---|
| sections/lk-{name}.liquid | |
| snippets/lk-{name}-{part}.liquid | |
| assets/lk-{name}.js | |
| assets/lk-{name}.css | |

## Shopify APIs
| Endpoint | Method | When |
|---|---|---|
| /cart.js | GET | on open |

## Liquid Objects Used
- `cart` — line items, total price
- `product` — ...

## Events
| Event | Direction | Payload |
|---|---|---|
| lk:cart:updated | fires | `{ cart }` |
| lk:drawer:open | listens | — |

## CSS Tokens
| Token | Default | Description |
|---|---|---|
| --lk-drawer-width | 420px | Panel width |

## Schema Settings
| ID | Type | Default | Description |
|---|---|---|---|
| heading | text | "Your cart" | Drawer title |
| show_order_note | checkbox | false | Toggle order note |

## Dependencies
Other LiquidKit components required. `none` if standalone.

## Manual Steps
Steps the CLI prints after install.
1. Add `{% render 'lk-cart-drawer' %}` before `</body>` in `layout/theme.liquid`
2. Merge `locales/en.default.schema.json` into theme locale files

## Accessibility
- [ ] Keyboard navigable
- [ ] Focus trapped when open
- [ ] Focus returns to trigger on close
- [ ] `aria-*` attributes listed: ...
- [ ] Works with `prefers-reduced-motion`

## Edge Cases
List known edge cases and how the component handles them.
- Empty cart → show empty state snippet
- Variant unavailable → ...

## Out of Scope
What this component explicitly does not do.
```

---

## Filled Examples

### cart-drawer

```md
# Component: cart-drawer

## Meta
| Field | Value |
|---|---|
| Name | cart-drawer |
| Tier | free |
| Priority | P0 |
| Status | planned |

## Purpose
Slide-in drawer showing cart contents with AJAX line item controls and checkout button.

## Files
| File | Purpose |
|---|---|
| sections/lk-cart-drawer.liquid | Section wrapper + schema |
| snippets/lk-cart-line-item.liquid | Single line item row |
| snippets/lk-cart-empty.liquid | Empty cart state |
| assets/lk-cart-drawer.js | Web component logic |
| assets/lk-cart-drawer.css | Styles + tokens |

## Shopify APIs
| Endpoint | Method | When |
|---|---|---|
| /cart.js | GET | on drawer open |
| /cart/add.js | POST | add to cart button (external) |
| /cart/change.js | POST | quantity change, line item remove |

## Liquid Objects Used
- `cart` — item count for initial badge render

## Events
| Event | Direction | Payload |
|---|---|---|
| lk:drawer:open | listens | — |
| lk:drawer:close | fires | — |
| lk:cart:updated | listens + fires | `{ cart }` |

## CSS Tokens
| Token | Default | Description |
|---|---|---|
| --lk-drawer-width | 420px | Panel width |
| --lk-drawer-bg | var(--lk-color-bg) | Panel background |
| --lk-drawer-z-index | var(--lk-z-drawer) | Stack order |
| --lk-drawer-padding | var(--lk-space-6) | Inner padding |
| --lk-cart-item-img-size | 80px | Line item image size |

## Schema Settings
| ID | Type | Default | Description |
|---|---|---|---|
| heading | text | "Your cart" | Drawer title |
| show_order_note | checkbox | false | Toggle order note field |
| free_shipping_threshold | number | 0 | Show progress bar if > 0 |
| checkout_button_label | text | "Checkout" | CTA label |

## Dependencies
none

## Manual Steps
1. Add `{% render 'lk-cart-drawer' %}` before `</body>` in `layout/theme.liquid`
2. Merge `locales/en.default.schema.json` into theme locale files

## Accessibility
- [ ] Keyboard navigable
- [ ] Focus trapped when open
- [ ] Focus returns to trigger on close
- [ ] `role="dialog"` `aria-modal="true"` `aria-label` on drawer element
- [ ] `aria-expanded` on trigger
- [ ] `aria-live="polite"` on cart total
- [ ] Works with `prefers-reduced-motion`

## Edge Cases
- Empty cart → render lk-cart-empty snippet
- Item removed → optimistic removal, revert on API error
- Quantity set to 0 → treat as remove
- Network error → show error message, restore previous quantity

## Out of Scope
- Upsell / cross-sell (V2)
- Discount code input
- Gift wrapping option
```

---

### variant-picker

```md
# Component: variant-picker

## Meta
| Field | Value |
|---|---|
| Name | variant-picker |
| Tier | free |
| Priority | P0 |
| Status | planned |

## Purpose
Renders product options as swatches, pills, or selects. Updates URL and fires variant change event.

## Files
| File | Purpose |
|---|---|
| sections/lk-variant-picker.liquid | Section wrapper + schema |
| snippets/lk-variant-option.liquid | Single option group |
| assets/lk-variant-picker.js | Web component logic |
| assets/lk-variant-picker.css | Styles + tokens |

## Shopify APIs
None — uses Liquid objects only, updates URL via `history.replaceState`.

## Liquid Objects Used
- `product.variants` — all variants with availability
- `product.options_with_values` — option names and values
- `product.selected_or_first_available_variant` — initial selected

## Events
| Event | Direction | Payload |
|---|---|---|
| lk:variant:changed | fires | `{ variantId, variant, available }` |

## CSS Tokens
| Token | Default | Description |
|---|---|---|
| --lk-swatch-size | 32px | Color swatch diameter |
| --lk-swatch-gap | var(--lk-space-2) | Gap between swatches |
| --lk-swatch-radius | var(--lk-radius-full) | Swatch border radius |
| --lk-pill-padding | var(--lk-space-1) var(--lk-space-3) | Pill padding |
| --lk-pill-radius | var(--lk-radius-md) | Pill border radius |

## Schema Settings
| ID | Type | Default | Description |
|---|---|---|---|
| color_option_name | text | "Color" | Which option renders as swatches |
| swatch_type | select | "circle" | circle / square |
| show_unavailable | checkbox | true | Show or hide unavailable variants |

## Dependencies
none

## Manual Steps
1. Place inside product form in your product template
2. Merge `locales/en.default.schema.json`

## Accessibility
- [ ] Keyboard navigable (arrow keys between options)
- [ ] `role="radiogroup"` on option group
- [ ] `role="radio"` + `aria-checked` on each option
- [ ] `aria-disabled` on unavailable options
- [ ] Works with `prefers-reduced-motion`

## Edge Cases
- Single variant product → render nothing
- All variants of a value unavailable → mark entire value disabled
- URL has `?variant=ID` on load → pre-select that variant

## Out of Scope
- Metafield-driven swatch images (V2)
- Combined listings
```