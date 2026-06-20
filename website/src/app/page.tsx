import { ChevronRight, Info, Zap, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CodeBlock } from "@/components/preview/CodeBlock";

export default function Page() {
  const codeExample = `<div class="user-profile">
  <h1>{{ user.name | capitalize }}</h1>
  
  {% if user.is_active %}
    <span class="badge">Active</span>
  {% else %}
    <span class="badge badge-inactive">Inactive</span>
  {% endif %}
</div>`;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 relative z-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex text-sm text-[#6A768B] mb-8">
        <ol className="inline-flex items-center space-x-2">
          <li>
            <Link href="#" className="hover:text-[#38D9A9] transition-colors">
              Documentation
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-[#A1ABB9]">Overview</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-[#F4F6F8] mb-4">
          Liquid reference
        </h1>
        <p className="text-lg text-[#A1ABB9] max-w-2xl leading-relaxed">
          A comprehensive guide to the LiquidKit templating language. Learn how
          to dynamically render content, manipulate data, and build performant
          developer interfaces.
        </p>
      </header>

      {/* Content Body */}
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-[#F4F6F8] mb-6 border-b border-[#22304E] pb-2">
            Introduction
          </h2>
          <p className="text-[#A1ABB9] mb-6 leading-relaxed">
            LiquidKit is designed to be highly secure, stateless, and incredibly
            fast. It operates on a strict context, meaning you only have access
            to the data explicitly passed into the rendering engine.
          </p>

          {/* Bento Grid Feature Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1A2744] rounded-lg p-6 border border-[#22304E] hover:border-[#38D9A9]/50 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#38D9A9] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#0B101F] rounded border border-[#22304E]">
                  <Zap className="w-5 h-5 text-[#38D9A9]" />
                </div>
                <h3 className="text-lg font-semibold text-[#F4F6F8]">
                  High Performance
                </h3>
              </div>
              <p className="text-[#A1ABB9] text-sm leading-relaxed">
                Compiled directly to optimized AST nodes, bypassing traditional
                regex parsing for sub-millisecond render times.
              </p>
            </div>

            <div className="bg-[#1A2744] rounded-lg p-6 border border-[#22304E] hover:border-[#38D9A9]/50 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#F4F6F8] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#0B101F] rounded border border-[#22304E]">
                  <Shield className="w-5 h-5 text-[#F4F6F8]" />
                </div>
                <h3 className="text-lg font-semibold text-[#F4F6F8]">
                  Secure Sandbox
                </h3>
              </div>
              <p className="text-[#A1ABB9] text-sm leading-relaxed">
                Memory-safe execution environment prevents access to the
                underlying file system or global variables.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[#F4F6F8] mb-6 border-b border-[#22304E] pb-2">
            Basic Usage
          </h2>
          <p className="text-[#A1ABB9] mb-6 leading-relaxed">
            Output variables by wrapping them in double curly braces. Filters
            can be applied using the pipe character <code>|</code>.
          </p>

          {/* Code Block */}
          <CodeBlock filename="example.liquid" code={codeExample} />

          {/* Callout / Info Alert */}
          <div className="flex gap-4 p-4 rounded-lg bg-[#1A2744] border-l-4 border-l-[#74C0FC] border-y border-r border-[#22304E] mb-6">
            <Info className="w-5 h-5 text-[#74C0FC] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[#F4F6F8] mb-1">
                Whitespace Control
              </h4>
              <p className="text-sm text-[#A1ABB9] leading-relaxed">
                You can strip whitespace from the left or right of a tag by
                adding a hyphen <code>-</code> to the tag&apos;s delimiter.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Pagination / Next Prev */}
      <div className="mt-16 pt-8 border-t border-[#22304E] flex justify-between items-center">
        <div /> {/* Empty left slot */}
        <Link
          href="#"
          className="group flex flex-col items-end p-4 rounded-lg border border-[#22304E] bg-[#1A2744] hover:border-[#38D9A9] transition-colors"
        >
          <span className="text-xs text-[#6A768B] mb-1 uppercase tracking-wider font-semibold">
            Next
          </span>
          <div className="flex items-center gap-2 text-[#F4F6F8] group-hover:text-[#38D9A9] transition-colors">
            <span className="text-lg font-semibold">Components</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
