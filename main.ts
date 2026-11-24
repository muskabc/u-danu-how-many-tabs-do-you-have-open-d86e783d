// How Many Tabs Do You Have Open? — entry program.
//
// Reads the honest tab count from line.txt (kept next to this file) and
// writes it, digits only and nothing else, to entry.txt inside the output
// directory. The output directory comes from MAKEFUN_OUTPUT_DIR and falls
// back to /output when the variable is unset or blank.

import * as fs from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_DIGITS = 5;
const FALLBACK_OUTPUT_DIR = "/output";
const ENTRY_NAME = "entry.txt";
const SOURCE_NAME = "line.txt";

function sourcePath(): string {
  return fileURLToPath(new URL(`./${SOURCE_NAME}`, import.meta.url));
}

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim() !== "") {
    return fromEnv;
  }
  return FALLBACK_OUTPUT_DIR;
}

function isDigitCode(code: number): boolean {
  return code >= 48 && code <= 57; // "0".."9"
}

// Reads the count and proves it is exactly one number of 1-5 digits,
// checked one character at a time (no pattern matching, no silent fixes).
function readCount(path: string): string {
  const raw = fs.readFileSync(path, "utf8");
  const digits = raw.trim();
  if (digits.length < 1 || digits.length > MAX_DIGITS) {
    throw new Error(
      `${SOURCE_NAME} must hold a number of 1-${MAX_DIGITS} digits, ` +
        `got ${digits.length} characters: ${JSON.stringify(raw)}`,
    );
  }
  for (let i = 0; i < digits.length; i += 1) {
    if (!isDigitCode(digits.charCodeAt(i))) {
      throw new Error(
        `${SOURCE_NAME} must hold digits only, ` +
          `bad character at position ${i}: ${JSON.stringify(raw)}`,
      );
    }
  }
  return digits;
}

// Writes the entry, then reads it straight back and proves the file on
// disk is byte-for-byte the digits we meant to write.
function writeAndVerify(dir: string, digits: string): string {
  fs.mkdirSync(dir, { recursive: true });
  const target = join(dir, ENTRY_NAME);
  fs.writeFileSync(target, digits, "utf8");
  const written = fs.readFileSync(target, "utf8");
  if (written !== digits || Buffer.byteLength(written, "utf8") !== digits.length) {
    throw new Error(
      `self-check failed: ${target} does not hold exactly ${JSON.stringify(digits)}`,
    );
  }
  return target;
}

function main(): void {
  const digits = readCount(sourcePath());
  const target = writeAndVerify(outputDir(), digits);
  console.log(`Wrote ${digits} (${digits.length} bytes) to ${target}`);
}

try {
  main();
} catch (error) {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
