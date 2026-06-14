import { NextRequest, NextResponse } from "next/server";
import { fetchComponent, fetchComponentFile } from "@/lib/registry";
import { renderComponent } from "@/lib/renderer";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("component");
  if (!slug) {
    return NextResponse.json(
      { error: "Missing component param" },
      { status: 400 },
    );
  }

  try {
    const meta = await fetchComponent(slug);

    const liquidFile = meta.files.find((f) => f.src.endsWith(".liquid"));
    const cssFile = meta.files.find((f) => f.src.endsWith(".css"));
    const jsFile = meta.files.find((f) => f.src.endsWith(".js"));

    if (!liquidFile) {
      return NextResponse.json(
        { error: "No liquid file found" },
        { status: 404 },
      );
    }

    const [liquidSource, cssSource, jsSource] = await Promise.all([
      fetchComponentFile(liquidFile.src),
      cssFile ? fetchComponentFile(cssFile.src) : Promise.resolve(""),
      jsFile ? fetchComponentFile(jsFile.src) : Promise.resolve(""),
    ]);

    const html = await renderComponent(slug, liquidSource, cssSource, jsSource);

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
