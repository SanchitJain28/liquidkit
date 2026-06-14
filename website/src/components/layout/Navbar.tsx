import Link from "next/link";

export function Navbar() {
  return (
    <header className="h-14 border-b border-zinc-800 flex items-center px-6 gap-6 bg-zinc-950 sticky top-0 z-50">
      <Link href="/" className="font-mono font-bold text-white text-sm">
        LiquidKit
      </Link>
      <nav className="flex items-center gap-4 text-sm text-zinc-400">
        <Link href="/components" className="hover:text-white transition-colors">
          Components
        </Link>
        <Link href="/docs" className="hover:text-white transition-colors">
          Docs
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <a
          href="https://github.com/SanchitJain28/liquidkit"
          target="_blank"
          rel="noopener"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
