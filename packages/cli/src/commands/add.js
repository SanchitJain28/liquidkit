import fs from "fs";
import path from "path";
import ora from "ora";
import pc from "picocolors";
import {
  fetchRegistry,
  fetchComponentMeta,
  fetchComponentSchema,
} from "../utils/registry.js";
import {
  downloadFile,
  applyPrefix,
  applyPrefixToPath,
} from "../utils/installer.js";
import { checkConflict } from "../utils/conflict.js";
import { promptConflictResolution } from "../utils/prompt.js";
import { mergeSettingsSchema, mergeLocales } from "../utils/merger.js";

/**
 * The `liquidkit add <component>` command.
 *
 * Options passed from Commander:
 *   options.dir     — theme root directory (default "./")
 *   options.prefix  — CSS/class prefix (default "lk-")
 *   options.force   — skip conflict prompts, always overwrite
 *   options.dryRun  — print actions without writing files
 */
export async function add(slug, options) {
  const themeDir = path.resolve(options.dir);
  const prefix = options.prefix;
  const force = options.force;
  const dryRun = options.dryRun;

  if (!fs.existsSync(themeDir)) {
    console.error(pc.red(`✖ Theme directory not found: ${themeDir}`));
    process.exit(1);
  }

  //? fetch the root registry
  const spinner = ora("Fetching registry…").start();
  let registry;
  try {
    registry = await fetchRegistry();
  } catch (err) {
    spinner.fail(pc.red(`Failed to fetch registry: ${err.message}`));
    process.exit(1);
  }

  if (!registry.components[slug]) {
    spinner.fail(
      pc.red(`Component "${slug}" not found in registry.`) +
        `\nRun ${pc.cyan("npx liquidkit list")} to see available components.`,
    );
    process.exit(1);
  }

  // ─── 3. Fetch component metadata ──────────────────────────────────────────
  let meta;
  try {
    meta = await fetchComponentMeta(slug);
  } catch (err) {
    spinner.fail(pc.red(err.message));
    process.exit(1);
  }

  spinner.succeed(`Found ${pc.bold(meta.name)} v${meta.version}`);

  // ─── 4. Install dependencies first ────────────────────────────────────────
  if (meta.dependencies && meta.dependencies.length > 0) {
    console.log(
      pc.dim(`\nInstalling ${meta.dependencies.length} dependencies…`),
    );
    for (const depSlug of meta.dependencies) {
      await add(depSlug, options);
    }
  }

  // ─── 5. Download + write component source files ────────────────────────────
  console.log();
  const written = [];
  const skipped = [];

  for (const file of meta.files) {
    const finalDest = applyPrefixToPath(file.dest, prefix);
    const absoluteDest = path.join(themeDir, finalDest);
    const destDir = path.dirname(absoluteDest);

    let content;
    try {
      const rawContent = await downloadFile(`components/${file.src}`);
      content = applyPrefix(rawContent, prefix);
    } catch (err) {
      console.error(pc.red(`  ✖ ${err.message}`));
      continue;
    }

    const status = checkConflict(absoluteDest, content);

    if (status === "same") {
      console.log(pc.dim(`  ─ ${finalDest} (unchanged)`));
      skipped.push(finalDest);
      continue;
    }

    if (status === "conflict" && !force) {
      const resolution = await promptConflictResolution(finalDest);
      if (resolution === "skip") {
        console.log(pc.dim(`  ─ ${finalDest} (skipped)`));
        skipped.push(finalDest);
        continue;
      }
    }

    if (!dryRun) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(absoluteDest, content, "utf-8");
    }

    const label = status === "conflict" ? "(overwritten)" : "(new)";
    console.log(`  ${pc.green("✔")} ${finalDest} ${pc.dim(label)}`);
    written.push(finalDest);
  }

  // ─── 6. First-install bootstrap ───────────────────────────────────────────
  const tokensPath = path.join(themeDir, "assets", "lk-tokens.css.liquid");
  const isFirstInstall = !fs.existsSync(tokensPath);

  if (isFirstInstall && !dryRun) {
    // Write lk-tokens.css.liquid (fetched from GitHub)
    const tokensSpinner = ora("Writing token stylesheet…").start();
    try {
      const tokensContent = await downloadFile(
        "components/tokens/lk-tokens.css.liquid",
      ).catch(() => buildDefaultTokens()); // fallback to inline if not on GitHub yet
      const finalTokensDest = path.join(
        themeDir,
        "assets",
        "lk-tokens.css.liquid",
      );
      fs.mkdirSync(path.dirname(finalTokensDest), { recursive: true });
      fs.writeFileSync(finalTokensDest, tokensContent, "utf-8");
      tokensSpinner.succeed(
        `${pc.green("✔")} assets/lk-tokens.css.liquid (first install)`,
      );
    } catch {
      tokensSpinner.fail(
        pc.yellow("⚠ Could not write lk-tokens.css.liquid — add manually"),
      );
    }
  }

  // ─── 7. Merge config/settings_schema.json ─────────────────────────────────
  if (!dryRun) {
    const schemaResult = mergeSettingsSchema(themeDir);
    if (schemaResult.action === "added") {
      console.log(
        `  ${pc.green("✔")} config/settings_schema.json ${pc.dim("(LiquidKit group added)")}`,
      );
    } else if (schemaResult.action === "skipped") {
      console.log(
        pc.dim(
          "  ─ config/settings_schema.json (LiquidKit group already present)",
        ),
      );
    }
    // "not_found" → silently skip (theme may not have one yet)
  }

  // ─── 8. Merge locales/en.default.schema.json ──────────────────────────────
  if (!dryRun) {
    const schema = await fetchComponentSchema(slug);
    if (schema?.locales) {
      const localeResult = mergeLocales(themeDir, slug, schema.locales);
      if (localeResult.action === "merged") {
        console.log(
          `  ${pc.green("✔")} locales/en.default.schema.json ${pc.dim(`(${slug} strings added)`)}`,
        );
      } else if (localeResult.action === "skipped") {
        console.log(
          pc.dim(
            `  ─ locales/en.default.schema.json (${slug} already present)`,
          ),
        );
      }
    }
  }

  // ─── 9. Print manual steps ────────────────────────────────────────────────
  const allManualSteps = meta.manualSteps || [];

  if (isFirstInstall) {
    allManualSteps.unshift(
      "Add to layout/theme.liquid inside <head>:\n     {{ 'lk-tokens.css.liquid' | asset_url | stylesheet_tag }}",
    );
  }

  console.log();

  if (allManualSteps.length > 0) {
    console.log(
      pc.bold(
        pc.yellow(
          `  ${allManualSteps.length} manual step${allManualSteps.length > 1 ? "s" : ""} required:`,
        ),
      ),
    );
    console.log();
    allManualSteps.forEach((step, i) => {
      console.log(`  ${pc.dim(`${i + 1}.`)} ${step}`);
    });
    console.log();
  }

  const summary = [
    written.length > 0
      ? `${written.length} file${written.length > 1 ? "s" : ""} written`
      : null,
    skipped.length > 0 ? `${skipped.length} skipped` : null,
  ]
    .filter(Boolean)
    .join(", ");

  console.log(
    pc.green(`✔ ${meta.name} installed`) +
      (summary ? pc.dim(` — ${summary}`) : ""),
  );

  if (dryRun) {
    console.log(pc.yellow("\n  Dry run — no files were written."));
  }
}

/**
 * Fallback inline token file if the GitHub-hosted one isn't available yet.
 */
function buildDefaultTokens() {
  return `{% comment %}
  LiquidKit token stylesheet.
  Maps Shopify theme settings to LiquidKit CSS custom properties.
  This file is auto-generated by the LiquidKit CLI.
{% endcomment %}
<style>
  :root {
    --lk-color-primary: {{ settings.lk_color_primary | default: '#000000' }};
    --lk-color-bg: {{ settings.lk_color_bg | default: '#ffffff' }};
    --lk-color-text: {{ settings.lk_color_text | default: '#1a1a1a' }};
    --lk-color-border: {{ settings.lk_color_border | default: '#e5e5e5' }};
    --lk-font-family: {{ settings.lk_font_body.family | default: 'sans-serif' }};
    --lk-border-radius: {{ settings.lk_border_radius | default: '4px' }};
  }
</style>
`;
}
