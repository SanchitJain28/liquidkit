import { notFound } from "next/navigation";
import { fetchComponent, fetchComponentFile, fetchComponentSchema } from "@/lib/registry";
import { ComponentCustomizer } from "@/components/preview/ComponentCustomizer";
import { CodeBlock } from "@/components/ui/code-block"; 

interface Props {
  params: Promise<{ slug: string }>;
}

function SchemaTable({ settings, title, description }: { settings: any[], title: string, description?: string }) {
  if (!settings || settings.length === 0) return null;
  return (
    <div className="mb-10">
      <h3 className="text-xl font-medium text-[#F4F6F8] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#A1ABB9] mb-4">{description}</p>}
      
      <div className="rounded-xl border border-[#22304E] overflow-hidden bg-[#060913]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#22304E] bg-[#0B101F]">
              <th className="py-3 px-4 font-semibold text-[#F4F6F8] w-1/3">Prop</th>
              <th className="py-3 px-4 font-semibold text-[#F4F6F8] w-1/3">Type</th>
              <th className="py-3 px-4 font-semibold text-[#F4F6F8] w-1/3">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#22304E]">
            {settings.map((s: any, i: number) => (
              <tr key={i} className="group hover:bg-[#0B101F]/50 transition-colors">
                <td className="py-4 px-4 align-top">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="px-1.5 py-0.5 rounded-md bg-[#1A2744] text-[#F4F6F8] font-mono text-[13px] border border-[#22304E]">{s.id}</code>
                  </div>
                  <div className="text-xs text-[#A1ABB9]">{s.label}{s.description ? ` — ${s.description}` : ""}</div>
                </td>
                <td className="py-4 px-4 align-top">
                  <code className="px-1.5 py-0.5 rounded-md bg-[#1A2744] text-[#A1ABB9] font-mono text-[13px] border border-[#22304E]">{s.type}</code>
                </td>
                <td className="py-4 px-4 align-top">
                  {s.default !== undefined && s.default !== null && s.default !== "" ? (
                    <code className="px-1.5 py-0.5 rounded-md bg-[#1A2744] text-[#A1ABB9] font-mono text-[13px] border border-[#22304E]">
                      {typeof s.default === 'string' ? `"${s.default}"` : String(s.default)}
                    </code>
                  ) : s.default === "" ? (
                    <code className="px-1.5 py-0.5 rounded-md bg-[#1A2744] text-[#A1ABB9] font-mono text-[13px] border border-[#22304E]">""</code>
                  ) : s.fallback_token ? (
                    <span className="text-xs text-[#A1ABB9]">
                      var(<code className="px-1 py-0.5 rounded-md bg-[#1A2744] text-[#A1ABB9] font-mono text-[12px] border border-[#22304E]">{s.fallback_token}</code>)
                    </span>
                  ) : (
                    <span className="text-[#6A768B]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params;

  let meta;
  let schema;
  try {
    meta = await fetchComponent(slug);
    schema = await fetchComponentSchema(slug);
  } catch {
    notFound();
  }

  const tabsData = await Promise.all(
    meta.files.map(async (f: any) => ({
      name: f.dest.split("/").pop() ?? f.dest,
      language: f.src.split(".").pop() ?? "text",
      code: await fetchComponentFile(f.src),
    })),
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 relative z-10">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-[#F4F6F8] mb-3">
          {meta.name}
        </h1>
        <p className="text-lg text-[#A1ABB9] leading-relaxed">
          {meta.description}
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#F4F6F8] mb-6 border-b border-[#22304E] pb-2">
          Preview
        </h2>
        <ComponentCustomizer slug={slug} schema={schema} />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#F4F6F8] mb-6 border-b border-[#22304E] pb-2">
          Installation
        </h2>

        <CodeBlock language="liquid" tabs={tabsData} />
      </section>

      {schema && (schema.section_settings?.length > 0 || schema.blocks?.length > 0) && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#F4F6F8] mb-6 border-b border-[#22304E] pb-2">
            API Reference
          </h2>
          
          <SchemaTable 
            settings={schema.section_settings} 
            title="Section Settings" 
            description={`The ${meta.name} component accepts the following section-level settings.`} 
          />

          {schema.blocks?.map((block: any, idx: number) => (
            <SchemaTable 
              key={idx}
              settings={block.settings} 
              title={`Block: ${block.type}`} 
              description={`Settings for the "${block.type}" block type.`} 
            />
          ))}
        </section>
      )}

      {meta.manualSteps && meta.manualSteps.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#F4F6F8] mb-6 border-b border-[#22304E] pb-2">
            Manual Steps
          </h2>
          <ol className="space-y-3">
            {meta.manualSteps.map((step: string, i: number) => (
              <li
                key={i}
                className="flex gap-4 p-4 rounded-lg bg-[#1A2744] border border-[#22304E] text-base text-[#A1ABB9] leading-relaxed"
              >
                <span className="text-[#38D9A9] font-mono font-semibold shrink-0">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const meta = await fetchComponent(slug);
    return { title: `${meta.name} — LiquidKit` };
  } catch {
    return { title: "Not Found — LiquidKit" };
  }
}
