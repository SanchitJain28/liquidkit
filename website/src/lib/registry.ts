import type { Registry, ComponentMeta } from "@/types";

const REGISTRY_URL =
  "https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/registry.json";

export async function fetchRegistry(): Promise<Registry> {
  const res = await fetch(REGISTRY_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch registry");
  return res.json();
}

export async function fetchComponent(slug: string): Promise<ComponentMeta> {
  const registry = await fetchRegistry();
  const component = registry.components[slug];
  if (!component) throw new Error(`Component "${slug}" not found`);
  return component;
}

export async function fetchComponentFile(src: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/components/${src}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch file: ${src}`);
  return res.text();
}
