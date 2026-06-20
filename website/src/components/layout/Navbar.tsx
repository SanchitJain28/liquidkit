import { Droplet, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-[64px] bg-[#0B101F] border-b border-[#22304E] flex items-center justify-between px-8 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <Droplet className="w-6 h-6 text-[#38D9A9] fill-current" />
        <span className="text-xl font-bold text-[#F4F6F8] tracking-tight">
          LiquidKit
        </span>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#A1ABB9]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-[#22304E] rounded-md leading-5 bg-[#060913] text-[#F4F6F8] placeholder-[#6A768B] focus:outline-none focus:ring-1 focus:ring-[#38D9A9] focus:border-[#38D9A9] sm:text-sm transition-colors"
            placeholder="Search documentation..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-[#A1ABB9] font-mono border border-[#22304E] rounded px-1.5 py-0.5 bg-[#0B101F]">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Trailing Action */}
      <div className="flex items-center">
        <Button className="bg-[#38D9A9]/10 hover:bg-[#38D9A9]/20">
          Log in
        </Button>
      </div>
    </nav>
  );
}
