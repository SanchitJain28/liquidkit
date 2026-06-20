import pc from "picocolors";
import { fetchRegistry } from "../utils/registry.js";
import ora from "ora";

export async function list() {
  const spinner = ora("Fetching component list…").start();

  let registry;
  try {
    registry = await fetchRegistry();
    spinner.stop();
  } catch (err) {
    spinner.fail(pc.red(`Failed to fetch registry: ${err.message}`));
    process.exit(1);
  }

  const components = Object.entries(registry.components);

  if (components.length === 0) {
    console.log(pc.yellow("No components found in registry."));
    return;
  }

  console.log();
  console.log(pc.bold("  Available components\n"));

  for (const [slug, meta] of components) {
    const tier = meta.tier === "free" ? pc.green("free") : pc.yellow("paid");
    console.log(`  ${pc.cyan(slug.padEnd(28))} ${tier.padEnd(10)}  ${pc.dim(meta.description)}`);
  }

  console.log();
  console.log(
    pc.dim(`  Install with: ${pc.reset(`npx liquidkit add ${pc.cyan("<component>")}`)}\n`)
  );
}
