import { Liquid } from "liquidjs";
import type { MockData } from "@/types";

const engine = new Liquid({
  strictFilters: false,
  strictVariables: false,
});

const MOCK_DATA: Record<string, MockData> = {
  "announcement-bar": {
    section: {
      settings: {
        autoplay: true,
        autoplay_speed: 4,
      },
      blocks: [
        {
          id: "block-1",
          type: "announcement",
          settings: {
            message: "Free shipping on orders over $50",
            link: "/collections/all",
            dismissible: true,
            bg_color: "#000000",
            text_color: "#ffffff",
          },
        },
        {
          id: "block-2",
          type: "announcement",
          settings: {
            message: "New arrivals just dropped",
            link: "/collections/new",
            dismissible: false,
            bg_color: "#e63946",
            text_color: "#ffffff",
          },
        },
      ],
    },
    shop: {
      name: "Demo Store",
      currency: "USD",
    },
  },
};

export async function renderComponent(
  slug: string,
  liquidSource: string,
  cssSource: string,
  jsSource: string,
): Promise<string> {
  const mockData = MOCK_DATA[slug];
  if (!mockData) throw new Error(`No mock data for component "${slug}"`);

  // Strip {% schema %} blocks — not valid outside Shopify
  const cleanedLiquid = liquidSource
    .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, "")
    .replace(
      /\{%-?\s*stylesheet\s*-?%\}[\s\S]*?\{%-?\s*endstylesheet\s*-?%\}/g,
      "",
    )
    .replace(
      /\{%-?\s*javascript\s*-?%\}[\s\S]*?\{%-?\s*endjavascript\s*-?%\}/g,
      "",
    );

  const body = await engine.parseAndRender(cleanedLiquid, mockData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${cssSource}</style>
</head>
<body style="margin:0;padding:0;background:transparent;">
  ${body}
  <script>${jsSource}</script>
</body>
</html>`;
}
