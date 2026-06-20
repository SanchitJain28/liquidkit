import pc from "picocolors";
import { fetchRegistry, fetchComponentMeta } from "../utils/registry.js";
import ora from "ora";

export async function info(slug) {
  const spinner = ora(`Fetching info for "${slug}"…`).start();

  let registry;
  try {
    registry = await fetchRegistry();
  } catch (err) {
    spinner.fail(pc.red(`Failed to fetch registry: ${err.message}`));
    process.exit(1);
  }

  if (!registry.components[slug]) {
    spinner.fail(
      pc.red(`Component "${slug}" not found.`) +
        `\nRun ${pc.cyan("npx liquidkit list")} to see available components.`
    );
    process.exit(1);
  }

  let meta;
  try {
    meta = await fetchComponentMeta(slug);
    spinner.stop();
  } catch (err) {
    spinner.fail(pc.red(err.message));
    process.exit(1);
  }

  console.log();
  console.log(`  ${pc.bold(meta.name)} ${pc.dim(`v${meta.version}`)}`);
  console.log(`  ${pc.dim(meta.description)}`);
  console.log(`  Tier: ${meta.tier === "free" ? pc.green("free") : pc.yellow("paid")}`);

  console.log(`\n  ${pc.bold("Files that will be written:")}`);
  for (const file of meta.files) {
    console.log(`    ${pc.dim("→")} ${file.dest}`);
  }

  if (meta.dependencies?.length > 0) {
    console.log(`\n  ${pc.bold("Dependencies:")}`);
    for (const dep of meta.dependencies) {
      console.log(`    ${pc.dim("→")} ${dep}`);
    }
  }

  if (meta.manualSteps?.length > 0) {
    console.log(`\n  ${pc.bold("Manual steps after install:")}`);
    meta.manualSteps.forEach((step, i) => {
      console.log(`    ${pc.dim(`${i + 1}.`)} ${step}`);
    });
  }

  console.log(
    `\n  ${pc.dim(`Install with: ${pc.reset(`npx liquidkit add ${pc.cyan(slug)}`)}\n`)}`
  );
}
