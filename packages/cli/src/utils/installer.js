import { REGISTRY_BASE_URL } from "./registry.js";

//? downloads the raw dile from the github
export async function downloadFile(relativePath) {
  const url = `${REGISTRY_BASE_URL}/${relativePath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${relativePath} (HTTP ${res.status})`);
  }
  return res.text();
}

//? apply the prefix
export function applyPrefix(content, prefix) {
  if (prefix === "lk-") return content;
  return content.replaceAll("lk-", prefix);
}

//? apply the prefix to the file destination path
export function applyPrefixToPath(destPath, prefix) {
  if (prefix === "lk-") return destPath;
  return destPath.replaceAll("lk-", prefix);
}
