# Announcement Bar

**Purpose:** Dismissible announcement banner. Single message or multi-message carousel with autoplay.

---

## Files

| File | Purpose |
|---|---|
| `sections/lk-announcement-bar.liquid` | Section wrapper + schema |
| `assets/lk-announcement-bar.js` | Web component logic |
| `assets/lk-announcement-bar.css` | Styles + tokens |

---

## Section Settings

| ID | Type | Default | Description |
|---|---|---|---|
| `autoplay` | checkbox | `true` | Auto-advance between announcements |
| `autoplay_speed` | range (2–8, step 1) | `4` | Seconds per slide |
| `show_nav_arrows` | checkbox | `true` | Show prev/next arrows |

---

## Blocks

**type:** `announcement`

| ID | Type | Default | Description |
|---|---|---|---|
| `message` | richtext | — | Announcement text |
| `link` | url | — | Wraps entire bar in anchor tag if set |
| `dismissible` | checkbox | `false` | Show ✕ dismiss button |
| `bg_color` | color | `--lk-color-primary` | Block background color |
| `text_color` | color | `--lk-color-primary-text` | Block text + icon color |

---

## CSS Tokens

| Token | Default | Description |
|---|---|---|
| `--lk-announcement-height` | `44px` | Bar height |
| `--lk-announcement-font-size` | `var(--lk-font-size-sm)` | Message font size |
| `--lk-announcement-font-weight` | `var(--lk-font-weight-medium)` | Message font weight |
| `--lk-announcement-padding-x` | `var(--lk-space-10)` | Horizontal padding |

---

## Behavior

- **Single block** → static bar, no carousel controls, autoplay irrelevant
- **Multiple blocks** → carousel with slide transition
  - Shows prev/next arrows if `show_nav_arrows` is true
  - Autoplays if `autoplay` is true
  - Pauses autoplay on hover
  - Pauses autoplay on focus (accessibility)
- **Dismissible blocks** → ✕ button visible, block ID stored in `lk_dismissed_announcements` (localStorage)
- **All blocks dismissed** → entire bar hidden, `hidden` attribute set on web component
- **Non-dismissible blocks** → never stored, always visible

---

## localStorage

| Key | Type | Value |
|---|---|---|
| `lk_dismissed_announcements` | `string[]` | Array of dismissed block IDs |

Block ID format: `{section.id}-{block.id}`

---

## Events

None fired or consumed.

---

## Accessibility

- `role="region"` + `aria-label="Announcement"` on the bar
- Carousel: `aria-live="polite"` on slide container (off during autoplay, on when user navigates)
- Dismiss button: `aria-label="Dismiss announcement"`
- Arrow buttons: `aria-label="Previous"` / `aria-label="Next"`
- Respects `prefers-reduced-motion` — disables slide transition and autoplay

---

## Edge Cases

| Case | Handling |
|---|---|
| All blocks dismissed | Hide entire bar via `hidden` attribute |
| Single block + dismissible | Dismiss hides bar entirely |
| Block has no message | Skip rendering that block |
| `autoplay_speed` not set | Default to 4s |
| User navigates manually | Reset autoplay timer |

---

## Manual Steps

1. Section is drag-and-droppable from theme editor — no `theme.liquid` edit required
2. Merge `locales/en.default.schema.json` into theme locale files

---

## Dependencies

None