import fs from "fs";
import path from "path";

//? The settings group we inject once into config/settings_schema.json
const LIQUIDKIT_SETTINGS_GROUP = {
  name: "LiquidKit",
  settings: [
    { type: "header", content: "Colors" },
    {
      type: "color",
      id: "lk_color_primary",
      label: "Primary color",
      default: "#000000",
    },
    {
      type: "color",
      id: "lk_color_bg",
      label: "Background color",
      default: "#ffffff",
    },
    {
      type: "color",
      id: "lk_color_text",
      label: "Text color",
      default: "#1a1a1a",
    },
    {
      type: "color",
      id: "lk_color_border",
      label: "Border color",
      default: "#e5e5e5",
    },
    { type: "header", content: "Typography" },
    {
      type: "font_picker",
      id: "lk_font_body",
      label: "Body font",
      default: "sans-serif",
    },
    { type: "header", content: "Layout" },
    {
      type: "text",
      id: "lk_border_radius",
      label: "Border radius",
      default: "4px",
      info: "e.g. 4px, 0.5rem, 999px for pill",
    },
  ],
};

/**
 * Append the LiquidKit settings group to config/settings_schema.json.
 * Safe to call multiple times — idempotent (won't duplicate the group).
 *
 * @param {string} themeDir — absolute path to theme root
 * @returns {{ action: "added" | "skipped" | "not_found" }}
 */
export function mergeSettingsSchema(themeDir) {
  const filePath = path.join(themeDir, "config", "settings_schema.json");

  if (!fs.existsSync(filePath)) {
    return { action: "not_found" };
  }

  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return { action: "not_found" }; // Malformed JSON — don't touch
  }

  // Idempotency check — already has LiquidKit group?
  const alreadyExists = schema.some((group) => group.name === "LiquidKit");
  if (alreadyExists) {
    return { action: "skipped" };
  }

  schema.push(LIQUIDKIT_SETTINGS_GROUP);
  fs.writeFileSync(filePath, JSON.stringify(schema, null, 2), "utf-8");
  return { action: "added" };
}

/**
 * Deep-merge component locale strings into locales/en.default.schema.json
 * under the liquid_components.{slug} namespace.
 * Safe to call multiple times — additive only, existing keys never overwritten.
 *
 * @param {string} themeDir — absolute path to theme root
 * @param {string} slug — component slug e.g. "announcement-bar"
 * @param {object} localeStrings — the component's locale object
 * @returns {{ action: "merged" | "skipped" | "not_found" }}
 */
export function mergeLocales(themeDir, slug, localeStrings) {
  if (!localeStrings) return { action: "skipped" };

  const filePath = path.join(themeDir, "locales", "en.default.schema.json");

  if (!fs.existsSync(filePath)) {
    return { action: "not_found" };
  }

  let locales;
  try {
    locales = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return { action: "not_found" };
  }

  // Use underscore slug key (announcement-bar → announcement_bar)
  const key = slug.replace(/-/g, "_");

  if (!locales.liquid_components) {
    locales.liquid_components = {};
  }

  if (locales.liquid_components[key]) {
    return { action: "skipped" }; // Already installed, don't overwrite
  }

  locales.liquid_components[key] = localeStrings;
  fs.writeFileSync(filePath, JSON.stringify(locales, null, 2), "utf-8");
  return { action: "merged" };
}

/**
 * Deep merge two plain objects. Source values do NOT overwrite existing dest values.
 * (additive merge only)
 */
function deepMergeAdditive(dest, source) {
  for (const key of Object.keys(source)) {
    if (
      key in dest &&
      typeof dest[key] === "object" &&
      typeof source[key] === "object"
    ) {
      deepMergeAdditive(dest[key], source[key]);
    } else if (!(key in dest)) {
      dest[key] = source[key];
    }
  }
}
