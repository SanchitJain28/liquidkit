import type { Registry, ComponentMeta } from "@/types";
import path from "path";
import fs from "fs";

const REGISTRY_URL =
  "https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/registry.json";

export async function fetchRegistry(): Promise<Registry> {
  if (process.env.NODE_ENV === "development") {
    const filePath = path.resolve(process.cwd(), "../registry.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  }

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
  if (process.env.NODE_ENV === "development") {
    const filePath = path.resolve(process.cwd(), `../components/${src}`);
    return fs.readFileSync(filePath, "utf-8");
  }

  const url = `https://raw.githubusercontent.com/SanchitJain28/liquidkit/main/components/${src}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch file: ${src}`);
  return res.text();
}

export async function fetchComponentSchema(slug: string): Promise<any> {
  try {
    const text = await fetchComponentFile(`${slug}/SCHEMA.json`);
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}
