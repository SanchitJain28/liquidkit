import Link from "next/link";
import { fetchRegistry } from "@/lib/registry";

export default async function Home() {
  const registry = await fetchRegistry();
  const count = Object.keys(registry.components).length;

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <p className="text-xs font-mono text-zinc-500 mb-4">
        npx liquidkit add cart-drawer
      </p>
      <h1 className="text-4xl font-bold text-white mb-4">
        Shopify Liquid UI components
      </h1>
      <p className="text-zinc-400 mb-8">
        {count} copy-paste components for Shopify themes. Theme-agnostic,
        vanilla JS, fully customizable via CSS tokens.
      </p>
      <div className="flex gap-3">
        <Link
          href="/components"
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-zinc-200 transition-colors"
        >
          Browse components
        </Link>
        <a
          href="https://github.com/SanchitJain28/liquidkit"
          target="_blank"
          rel="noopener"
          className="px-4 py-2 border border-zinc-700 text-sm text-zinc-300 rounded hover:border-zinc-500 transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
