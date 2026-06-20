import Link from "next/link";
import { LayoutDashboard, Component } from "lucide-react";
import { fetchRegistry } from "@/lib/registry";

export async function Sidebar() {
  const registry = await fetchRegistry();
  const components = Object.entries(registry.components);


  const free = components.filter(([, meta]: any) => meta.tier === "free");
  const paid = components.filter(([, meta]: any) => meta.tier === "paid");

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-[#0B101F] border-r border-[#22304E] py-6 overflow-y-auto shrink-0 z-40 fixed top-[64px] bottom-0">
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-[#F4F6F8] mb-1">
          Documentation
        </h2>
        <span className="text-xs font-mono text-[#A1ABB9] bg-[#1A2744] px-2 py-1 rounded border border-[#22304E]">
          v1.0.4
        </span>
      </div>

      <nav className="flex-1 px-2 space-y-4">
        {/* Fixed Overview Link */}
        <Link
          href="/"
          className="group flex items-center gap-3 px-3 py-2 text-[#38D9A9] bg-[#1A2744] border-l-2 border-[#38D9A9] rounded-r-md transition-colors"
        >
          <LayoutDashboard className="w-5 h-5 fill-current/20" />
          <span className="text-sm font-medium">Overview</span>
        </Link>

        {/* Dynamic Groups */}
        <div>
          <SidebarGroup label="Free Components" items={free} />
          {paid.length > 0 && (
            <SidebarGroup label="Pro Components" items={paid} />
          )}
        </div>
      </nav>
    </aside>
  );
}

function SidebarGroup({
  label,
  items,
}: {
  label: string;
  items: [string, any][];
}) {
  return (
    <div className="mb-6 pt-2">
      <h3 className="px-3 text-xs font-semibold text-[#6A768B] uppercase tracking-wider mb-2">
        {label}
      </h3>
      <ul className="space-y-1">
        {items.map(([slug, meta]) => (
          <li key={slug}>
            <Link
              href={`/components/${slug}`}
              className="group flex items-center gap-3 px-3 py-2 text-[#A1ABB9] hover:bg-[#1A2744] hover:text-[#F4F6F8] rounded-md transition-colors border-l-2 border-transparent"
            >
              <Component className="w-4 h-4 text-[#A1ABB9] group-hover:text-[#F4F6F8]" />
              <span className="text-sm font-medium">{meta.name || slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
