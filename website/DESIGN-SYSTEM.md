# LiquidKit Website Design System

## Inspiration
Based on the Shopify Developer Docs (Dark Mode). Professional, highly readable, deep blue aesthetic with high-contrast typography.

## 🎨 Color Palette

### Backgrounds
*   **Background Base** (Sidebar, Navbar): `#0B101F`
*   **Background Content** (Main reading area): `#101B2E`
*   **Background Hover/Surface** (Buttons, active sidebar items): `#1A2744`
*   **Border/Divider**: `#22304E`

### Text & Typography
*   **Text Primary** (Headings, active links): `#F4F6F8` (Off-white, less strain than pure `#FFF`)
*   **Text Secondary** (Paragraphs, lists): `#A1ABB9` (Cool light gray)
*   **Text Muted** (Breadcrumbs, inactive nav): `#6A768B`

### Accents
*   **Primary Action / Focus Rings**: `#38D9A9` (Teal/Mint - very Shopify-esque developer vibe)
*   **Code Block Background**: `#060913` (Very dark, almost black)
*   **Inline Code Text**: `#74C0FC` (Light blue)

---

## 🔤 Typography

**Font Families:**
*   **Sans-serif (Headings & UI):** `Inter`, system-ui, sans-serif
*   **Monospace (Code):** `JetBrains Mono`, `Fira Code`, monospace

**Scale & Weights:**
*   **H1 (Page Title):**
    *   Size: `36px` (`2.25rem`)
    *   Weight: `700` (Bold)
    *   Line Height: `1.2`
    *   Tracking: `-0.02em`
*   **H2 (Section Heading):**
    *   Size: `24px` (`1.5rem`)
    *   Weight: `600` (Semi-bold)
    *   Line Height: `1.3`
*   **H3 (Sub-section):**
    *   Size: `18px` (`1.125rem`)
    *   Weight: `600` (Semi-bold)
    *   Line Height: `1.4`
*   **Body (p, li):**
    *   Size: `16px` (`1rem`)
    *   Weight: `400` (Regular)
    *   Line Height: `1.6` (Crucial for readability)
*   **Small / Sidebar Nav:**
    *   Size: `14px` (`0.875rem`)
    *   Weight: `500` (Medium)
    *   Line Height: `1.5`

---

## 🧩 Component Rules

*   **Sidebar:** Fixed to the left, 280px wide. Background `#0B101F`. Active states get a subtle background `#1A2744` with a left border using the Accent color.
*   **Navbar:** Fixed top, height 64px. Background `#0B101F`. Contains Search bar and utility links.
*   **Buttons:** Slight border radius (`4px` or `rounded-md`).
*   **Code Blocks:** Rounded corners (`rounded-lg`), pure dark background `#060913`, with a "Copy MD" utility button in the top right.