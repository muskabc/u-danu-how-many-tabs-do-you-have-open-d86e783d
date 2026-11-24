import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(here, "line.txt"), "utf8");
const digits = raw.trim();

if (!/^\d{1,5}$/.test(digits)) {
  throw new Error(`line.txt must hold exactly one number of 1-5 digits, got: ${JSON.stringify(raw)}`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), digits, "utf8");
console.log(`Wrote ${digits} to ${join(outDir, "entry.txt")}`);
