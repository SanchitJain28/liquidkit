export const REGISTRY_BASE_URL =
  "https://raw.githubusercontent.com/SanchitJain28/liquidkit/main";

/**
 * Fetch and parse the root registry.json from GitHub.
 * Returns the full components map.
 */
export async function fetchRegistry() {
  const res = await fetch(`${REGISTRY_BASE_URL}/registry.json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch registry (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Fetch and parse a specific component's registry.json from GitHub.
 * The component's registry.json lives at:
 *   components/{slug}/registry.json
 */
export async function fetchComponentMeta(slug) {
  const url = `${REGISTRY_BASE_URL}/components/${slug}/registry.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch metadata for "${slug}" (HTTP ${res.status}). ` +
        `Does the component exist in the registry?`
    );
  }
  return res.json();
}

/**
 * Fetch and parse the SCHEMA.json for a component.
 * Used for building the settings_schema.json group and locale strings.
 */
export async function fetchComponentSchema(slug) {
  const url = `${REGISTRY_BASE_URL}/components/${slug}/SCHEMA.json`;
  const res = await fetch(url);
  if (!res.ok) return null; // Schema is optional
  return res.json();
}
