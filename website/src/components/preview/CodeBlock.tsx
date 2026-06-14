"use client";

import { useState } from "react";

interface CodeFile {
  label: string;
  language: string;
  code: string;
}

interface CodeBlockProps {
  files: CodeFile[];
}

export function CodeBlock({ files }: CodeBlockProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex border-b border-zinc-800 bg-zinc-950">
        {files.map((file, i) => (
          <button
            key={file.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-mono transition-colors ${
              active === i
                ? "text-white border-b-2 border-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {file.label}
          </button>
        ))}
        <button
          onClick={() => navigator.clipboard.writeText(files[active].code)}
          className="ml-auto px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 bg-zinc-950 overflow-x-auto text-sm">
        <code className="text-zinc-300 font-mono">{files[active].code}</code>
      </pre>
    </div>
  );
}
