"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Plus } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ComponentCustomizerProps {
  slug: string;
  schema: any;
}

export function ComponentCustomizer({
  slug,
  schema,
}: ComponentCustomizerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string>("");
  const [height, setHeight] = useState(200);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [mockData, setMockData] = useState({
    section: {
      settings: schema?.preview_data?.section_settings || {},
      blocks: schema?.preview_data?.blocks || [],
    },
    shop: { name: "Demo Store", currency: "USD" },
  });

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/preview?component=${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mockData }),
        });
        if (!res.ok) throw new Error("Failed to load preview");
        const newHtml = await res.text();
        setHtml(newHtml);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPreview, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [slug, mockData]);

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

  const updateSectionSetting = (id: string, value: any) => {
    setMockData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        settings: {
          ...prev.section.settings,
          [id]: value,
        },
      },
    }));
  };

  const updateBlockSetting = (
    blockId: string,
    settingId: string,
    value: any,
  ) => {
    setMockData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        blocks: prev.section.blocks.map((block: any) =>
          block.id === blockId
            ? {
                ...block,
                settings: {
                  ...block.settings,
                  [settingId]: value,
                },
              }
            : block,
        ),
      },
    }));
  };

  const removeBlock = (blockId: string) => {
    setMockData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        blocks: prev.section.blocks.filter((b: any) => b.id !== blockId),
      },
    }));
  };

  const addBlock = (blockType: string) => {
    const blockSchema = schema.blocks.find((b: any) => b.type === blockType);
    if (!blockSchema) return;

    const defaultSettings: any = {};
    blockSchema.settings.forEach((s: any) => {
      defaultSettings[s.id] = s.default;
    });

    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      settings: defaultSettings,
    };

    setMockData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        blocks: [...prev.section.blocks, newBlock],
      },
    }));
  };

  // Render dynamic inputs based on schema types
  const renderInput = (
    setting: any,
    value: any,
    onChange: (val: any) => void,
  ) => {
    switch (setting.type) {
      case "checkbox":
        return (
          <div className="flex items-center justify-between" key={setting.id}>
            <Label className="text-sm font-medium text-[#A1ABB9]">
              {setting.label}
            </Label>
            <Switch checked={value || false} onCheckedChange={onChange} />
          </div>
        );
      case "range":
        return (
          <div className="space-y-3" key={setting.id}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[#A1ABB9]">
                {setting.label}
              </Label>
              <span className="text-xs text-[#6A768B]">
                {value}
                {setting.unit}
              </span>
            </div>
            <Slider
              value={[value || setting.min || 0]}
              onValueChange={(val) => onChange(val[0])}
              min={setting.min || 0}
              max={setting.max || 100}
              step={setting.step || 1}
              className="w-full"
            />
          </div>
        );
      case "color":
        return (
          <div className="space-y-1.5" key={setting.id}>
            <Label className="text-sm font-medium text-[#A1ABB9]">
              {setting.label}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 p-1 bg-[#1A2744] border-[#22304E] rounded-md cursor-pointer"
              />
              <Input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-[#1A2744] border-[#22304E] text-[#F4F6F8] font-mono text-sm"
              />
            </div>
          </div>
        );
      case "richtext":
      case "text":
      case "url":
      default:
        return (
          <div className="space-y-1.5" key={setting.id}>
            <Label className="text-sm font-medium text-[#A1ABB9]">
              {setting.label}
            </Label>
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="bg-[#1A2744] border-[#22304E] text-[#F4F6F8]"
              placeholder={setting.placeholder || ""}
            />
          </div>
        );
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex w-full min-h-[400px] border border-[#22304E] rounded-xl overflow-hidden bg-[#060913]">
        {/* Editor Sidebar */}
        <Sidebar
          className="w-80 border-r border-[#22304E] bg-[#0B101F]"
          collapsible="none"
        >
          <SidebarHeader className="p-4 border-b border-[#22304E]">
            <h3 className="font-semibold text-[#F4F6F8]">Customizer</h3>
            <p className="text-xs text-[#A1ABB9]">
              Configure component settings
            </p>
          </SidebarHeader>
          <SidebarContent className="p-4 space-y-6 overflow-y-auto">
            {/* Section Settings */}
            {schema?.section_settings?.length > 0 && (
              <SidebarGroup className="p-0 border-none bg-transparent">
                <SidebarGroupLabel className="px-0 font-semibold text-[#F4F6F8] mb-4 text-sm uppercase tracking-wider">
                  Section Settings
                </SidebarGroupLabel>
                <div className="space-y-6">
                  {schema.section_settings.map((setting: any) =>
                    renderInput(
                      setting,
                      mockData.section.settings[setting.id],
                      (val) => updateSectionSetting(setting.id, val),
                    ),
                  )}
                </div>
              </SidebarGroup>
            )}

            {/* Blocks */}
            {schema?.blocks?.length > 0 && (
              <SidebarGroup className="p-0 border-none bg-transparent pt-6 border-t border-[#22304E]">
                <SidebarGroupLabel className="px-0 font-semibold text-[#F4F6F8] mb-2 text-sm uppercase tracking-wider">
                  Blocks
                </SidebarGroupLabel>
                <Accordion type="single" collapsible className="w-full">
                  {mockData.section.blocks.map((block: any, idx: number) => {
                    const blockSchema = schema.blocks.find(
                      (b: any) => b.type === block.type,
                    );
                    if (!blockSchema) return null;

                    return (
                      <AccordionItem
                        value={block.id}
                        key={block.id}
                        className="border-[#22304E]"
                      >
                        <AccordionTrigger className="text-sm font-medium text-[#F4F6F8] hover:text-[#38D9A9] py-3">
                          {block.settings.title ||
                            block.type ||
                            `Block ${idx + 1}`}
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 space-y-6">
                          {blockSchema.settings.map((setting: any) =>
                            renderInput(
                              setting,
                              block.settings[setting.id],
                              (val) =>
                                updateBlockSetting(block.id, setting.id, val),
                            ),
                          )}
                          <button
                            onClick={() => removeBlock(block.id)}
                            className="flex items-center justify-center gap-2 w-full pt-4 mt-4 border-t border-[#22304E] text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove block
                          </button>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
                <div className="pt-4 flex flex-col gap-2">
                  {schema.blocks.map((blockType: any) => (
                    <button
                      key={blockType.type}
                      onClick={() => addBlock(blockType.type)}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-[#1A2744] hover:bg-[#22304E] border border-[#22304E] rounded-md transition-colors text-sm font-medium text-[#F4F6F8]"
                    >
                      <Plus className="w-4 h-4" />
                      Add {blockType.type}
                    </button>
                  ))}
                </div>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        {/* Live Preview Area */}
        <div className="flex-1 flex flex-col relative bg-[#101B2E]">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#F4F6F8 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 overflow-y-auto">
            {loading && !html && (
              <Loader2 className="w-6 h-6 text-[#A1ABB9] animate-spin absolute" />
            )}
            {error && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 flex flex-col items-center justify-center text-red-400 text-sm gap-2 p-6 shadow-sm w-full max-w-md">
                <p className="font-medium">Preview Error</p>
                <p className="opacity-80 text-center">{error}</p>
              </div>
            )}

            {!error && html && (
              <iframe
                ref={iframeRef}
                srcDoc={finalHtml}
                sandbox="allow-scripts"
                className={`w-full transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}
                style={{
                  height: Math.max(200, height),
                  border: "none",
                  display: "block",
                  background: "transparent",
                }}
                title={`${slug} preview`}
              />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
