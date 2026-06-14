"use client";

import { useEffect, useState } from "react";

interface ComponentPreviewProps {
  slug: string;
  height?: number;
}

export function ComponentPreview({
  slug,
  height = 120,
}: ComponentPreviewProps) {
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/preview?component=${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preview");
        return res.text();
      })
      .then((html) => setHtml(html))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-500 text-sm"
      >
        Loading preview...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800 text-red-400 text-sm"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden bg-white">
      <iframe
        srcDoc={html}
        sandbox="allow-scripts"
        style={{ width: "100%", height, border: "none", display: "block" }}
        title={`${slug} preview`}
      />
    </div>
  );
}
