import fs from "fs";

/**
 * Check whether a destination file in the theme already exists, and whether
 * its content differs from what we're about to write.
 *
 * Returns:
 *   "new"      — file doesn't exist, safe to write
 *   "same"     — file exists with identical content, skip
 *   "conflict" — file exists with different content, prompt user
 */
export function checkConflict(absoluteDest, newContent) {
  //? checks this if file exists , if not returns new else check if the file is same or conflict
  if (!fs.existsSync(absoluteDest)) return "new";
  const existing = fs.readFileSync(absoluteDest, "utf-8");
  return existing === newContent ? "same" : "conflict";
}
