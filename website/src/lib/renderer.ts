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
            link: "",
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
            link: "",
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
  customMockData?: any
): Promise<string> {
  const mockData = customMockData || MOCK_DATA[slug];
  if (!mockData) throw new Error(`No mock data for component "${slug}"`);

  const cleanedLiquid = liquidSource
    .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, "")
    .replace(
      /\{%-?\s*stylesheet\s*-?%\}[\s\S]*?\{%-?\s*endstylesheet\s*-?%\}/g,
      "",
    )
    .replace(
      /\{%-?\s*javascript\s*-?%\}[\s\S]*?\{%-?\s*endjavascript\s*-?%\}/g,
      "",
    )
    .replace(/\{\{[^}]*stylesheet_tag[^}]*\}\}/g, "")
    .replace(/<script[^>]*asset_url[^>]*><\/script>/g, "");

  const body = await engine.parseAndRender(cleanedLiquid, mockData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${cssSource}</style>
  <style>
    /* Premium preview container styles */
    body {
      margin: 0;
      padding: 1.5rem;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      gap: 1.5rem;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #F4F6F8;
      -webkit-font-smoothing: antialiased;
    }
    /* Let components take full width if they want, but max out at a readable width */
    body > * {
      width: 100%;
      max-width: 800px;
    }
  </style>
</head>
<body style="background:transparent;">
  ${body}
  <script>${jsSource}</script>
</body>
</html>`;
}
