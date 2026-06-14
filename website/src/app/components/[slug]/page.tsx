import { notFound } from "next/navigation";
import { fetchComponent, fetchComponentFile } from "@/lib/registry";
import { ComponentPreview } from "@/components/preview/ComponentPreview";
import { CodeBlock } from "@/components/preview/CodeBlock";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params;

  let meta;
  try {
    meta = await fetchComponent(slug);
  } catch {
    notFound();
  }

  const fileContents = await Promise.all(
    meta.files.map(async (f) => ({
      label: f.dest.split("/").pop() ?? f.dest,
      language: f.src.split(".").pop() ?? "text",
      code: await fetchComponentFile(f.src),
    })),
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">{meta.name}</h1>
        <p className="text-zinc-400 text-sm">{meta.description}</p>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Preview
        </h2>
        <ComponentPreview slug={slug} />
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Files
        </h2>
        <CodeBlock files={fileContents} />
      </section>

      {meta.manualSteps.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Manual Steps
          </h2>
          <ol className="space-y-2">
            {meta.manualSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400">
                <span className="text-zinc-600 font-mono">{i + 1}.</span>
                {step}
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
