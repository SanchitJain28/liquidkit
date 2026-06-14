import Link from "next/link";
import { fetchRegistry } from "@/lib/registry";

export async function Sidebar() {
  const registry = await fetchRegistry();
  const components = Object.entries(registry.components);

  const free = components.filter(([, meta]) => meta.tier === "free");
  const paid = components.filter(([, meta]) => meta.tier === "paid");

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 h-full py-6 px-4">
      <SidebarGroup label="Free" items={free} />
      {paid.length > 0 && <SidebarGroup label="Pro" items={paid} />}
    </aside>
  );
}

function SidebarGroup({
  label,
  items,
}: {
  label: string;
  items: [string, { name: string }][];
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map(([slug, meta]) => (
          <li key={slug}>
            <Link
              href={`/components/${slug}`}
              className="block text-sm text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors hover:bg-zinc-800"
            >
              {meta.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
