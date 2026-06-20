"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ComponentPreviewProps {
  slug: string;
}

export function ComponentPreview({ slug }: ComponentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string>("");
  const [height, setHeight] = useState(200);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/preview?component=${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preview");
        return res.text();
      })
      .then(setHtml)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "lk-preview-height") {
        setHeight(Math.max(200, e.data.height));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const heightReporter = `
    <script>
      function reportHeight() {
        window.parent.postMessage({ type: "lk-preview-height", height: document.body.scrollHeight }, "*")
      }
      window.addEventListener("load", reportHeight)
      new ResizeObserver(reportHeight).observe(document.body)
    </script>
  `;

  const finalHtml = html
    ? html.replace("</body>", `${heightReporter}</body>`)
    : "";

  if (loading) {
    return (
      <div className="min-h-[200px] w-full rounded-xl border border-[#22304E] bg-[#060913] flex items-center justify-center shadow-sm">
        <Loader2 className="w-5 h-5 text-[#A1ABB9] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] w-full rounded-xl border border-red-900/50 bg-red-950/20 flex flex-col items-center justify-center text-red-400 text-sm gap-2 shadow-sm">
        <p className="font-medium">Preview Error</p>
        <p className="opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl border border-[#22304E] bg-[#060913] overflow-hidden shadow-sm">
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" 
        style={{ 
          backgroundImage: 'radial-gradient(#F4F6F8 1px, transparent 1px)', 
          backgroundSize: '16px 16px' 
        }}
      />
      <iframe
        ref={iframeRef}
        srcDoc={finalHtml}
        sandbox="allow-scripts"
        className="relative z-10 w-full"
        style={{
          height,
          border: "none",
          display: "block",
          background: "transparent",
        }}
        title={`${slug} preview`}
      />
    </div>
  );
}
