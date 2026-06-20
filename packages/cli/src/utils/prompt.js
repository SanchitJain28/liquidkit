import { select } from "@inquirer/prompts";

/**
 * Ask the user what to do when a file already exists with different content.
 * Returns: "overwrite" | "skip"
 */
export async function promptConflictResolution(filename) {
  return select({
    message: `File already exists: ${filename}`,
    choices: [
      { name: "Overwrite", value: "overwrite" },
      { name: "Skip", value: "skip" },
    ],
  });
}
