"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { JetBrains_Mono } from "next/font/google";

interface CodeFile {
  label: string;
  language: string;
  code: string;
  highlightLines?: number[];
}

interface CodeBlockProps {
  files: CodeFile[];
}

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
});

export function CodeBlock({ files }: CodeBlockProps) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!files || files.length === 0) return null;

  const activeFile = files[active];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${jetbrainsMono.className}`}>
      <div className="bg-[#060913] rounded-lg border border-[#22304E] overflow-hidden mb-6 relative group shadow-sm">
        <div className="flex items-center justify-between bg-[#0B101F] border-b border-[#22304E] px-2">
          <div className="flex overflow-x-auto">
            {files.map((file, i) => (
              <button
                key={file.label}
                onClick={() => setActive(i)}
                className={`px-4 py-2.5 text-xs font-mono transition-colors border-b-2 whitespace-nowrap ${
                  active === i
                    ? "text-[#F4F6F8] border-[#38D9A9] bg-[#1A2744]/50" // Active tab
                    : "text-[#A1ABB9] border-transparent hover:text-[#F4F6F8] hover:bg-[#1A2744]/30" // Inactive tab
                }`}
              >
                {file.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="text-[#A1ABB9] hover:text-[#38D9A9] transition-colors flex items-center gap-1.5 px-3 py-2 opacity-0 group-hover:opacity-100 shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="text-xs font-medium font-sans">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          <SyntaxHighlighter
            language={activeFile.language || "text"}
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: 0,
              background: "transparent",
              fontSize: "0.875rem",
              fontFamily: "var(--font-mono), monospace",
            }}
            codeTagProps={{
              style: { fontFamily: "var(--font-mono), monospace" },
            }}
            wrapLines={true}
            showLineNumbers={true}
            lineProps={(lineNumber) => {
              const linesToHighlight = activeFile.highlightLines || [];
              return {
                style: {
                  backgroundColor: linesToHighlight.includes(lineNumber)
                    ? "rgba(56, 217, 169, 0.1)"
                    : "transparent",
                  display: "block",
                  width: "100%",
                },
              };
            }}
            PreTag="div"
          >
            {String(activeFile.code)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
