"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { JetBrains_Mono } from "next/font/google";

type CodeBlockProps = {
  language: string;
  filename?: string;
  highlightLines?: number[];
} & (
  | {
      code: string;
      tabs?: never;
    }
  | {
      code?: never;
      tabs: Array<{
        name: string;
        code: string;
        language?: string;
        highlightLines?: number[];
      }>;
    }
);

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
});

export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = [],
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeCode = tabsExist ? tabs[activeTab].code : code;
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language;
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || []
    : highlightLines;

  return (
    <div className={`${jetbrainsMono.className}`}>
      <div className="relative w-full rounded-lg bg-[#060913] border border-[#22304E] p-4 font-mono text-sm shadow-sm mb-6 group">
        <div className="flex flex-col gap-2">
          {tabsExist && (
            <div className="flex overflow-x-auto border-b border-[#22304E] pb-2 mb-2">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-3 !py-2 text-xs transition-colors font-sans rounded-md ${
                    activeTab === index
                      ? "bg-[#1A2744] text-[#F4F6F8]"
                      : "text-[#A1ABB9] hover:text-[#F4F6F8] hover:bg-[#1A2744]/50"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}
          {!tabsExist && filename && (
            <div className="flex justify-between items-center py-2 border-b border-[#22304E] mb-2">
              <div className="text-xs text-[#A1ABB9] font-mono">{filename}</div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs text-[#A1ABB9] hover:text-[#38D9A9] transition-colors font-sans opacity-0 group-hover:opacity-100"
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}

          {/* If tabs exist, we put the copy button absolutely positioned so it aligns well */}
          {tabsExist && (
            <button
              onClick={copyToClipboard}
              className="absolute top-5 right-4 flex items-center gap-1 text-xs text-[#A1ABB9] hover:text-[#38D9A9] transition-colors font-sans opacity-0 group-hover:opacity-100 bg-[#060913] pl-2"
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>

        <SyntaxHighlighter
          language={activeLanguage}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "0.875rem",
            fontFamily: "var(--font-mono), monospace",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono), monospace" }
          }}
          wrapLines={true}
          showLineNumbers={true}
          lineProps={(lineNumber) => ({
            style: {
              backgroundColor: activeHighlightLines.includes(lineNumber)
                ? "rgba(56, 217, 169, 0.1)" // #38D9A9 at 10% opacity
                : "transparent",
              display: "block",
              width: "100%",
            },
          })}
          PreTag="div"
        >
          {String(activeCode)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
