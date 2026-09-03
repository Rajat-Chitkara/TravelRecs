/**
 * Stage 0 -> data/raw/<city>/. Copies threads.json + mentions.json from the
 * upstream extraction output into this project's data/raw/<city>/ folder.
 *
 * Usage:
 *   npm run pull-data -- tokyo
 *   npm run pull-data -- paris --source="C:\path\to\paris\extraction\output"
 *
 * For Tokyo, the source defaults to the Travel_json sibling folder where the
 * Reddit-thread extraction pipeline wrote threads.json/mentions.json. Future
 * cities must pass --source explicitly until they have a similar default.
 */
import fs from "node:fs";
import path from "node:path";
import { rawDir } from "./lib/paths.ts";

const DEFAULT_SOURCES: Record<string, string> = {
  tokyo: "C:\\Users\\RAJAT\\Downloads\\Travel_json",
  bangkok: "C:\\Users\\RAJAT\\Downloads\\Travel_json\\Bangkok",
};

function parseArgs(argv: string[]) {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const citySlug = positional[0];
  const sourceArg = argv.find((a) => a.startsWith("--source="));
  const source = sourceArg ? sourceArg.slice("--source=".length) : undefined;
  return { citySlug, source };
}

function main() {
  const { citySlug, source } = parseArgs(process.argv.slice(2));

  if (!citySlug) {
    console.error("Usage: npm run pull-data -- <city-slug> [--source=<path>]");
    process.exit(1);
  }

  const sourceDir = source ?? DEFAULT_SOURCES[citySlug];
  if (!sourceDir) {
    console.error(
      `No default source configured for "${citySlug}". Pass --source=<path> pointing ` +
        `to the folder containing threads.json and mentions.json.`
    );
    process.exit(1);
  }

  const sourceThreads = path.join(sourceDir, "threads.json");
  const sourceMentions = path.join(sourceDir, "mentions.json");

  for (const f of [sourceThreads, sourceMentions]) {
    if (!fs.existsSync(f)) {
      console.error(`Missing source file: ${f}`);
      process.exit(1);
    }
  }

  const destDir = rawDir(citySlug);
  fs.mkdirSync(destDir, { recursive: true });

  const destThreads = path.join(destDir, "threads.json");
  const destMentions = path.join(destDir, "mentions.json");

  fs.copyFileSync(sourceThreads, destThreads);
  fs.copyFileSync(sourceMentions, destMentions);

  const threadCount = JSON.parse(fs.readFileSync(destThreads, "utf-8")).length;
  const mentionCount = JSON.parse(fs.readFileSync(destMentions, "utf-8")).length;

  console.log(`Pulled data for "${citySlug}" from ${sourceDir}`);
  console.log(`  -> ${destThreads} (${threadCount} threads)`);
  console.log(`  -> ${destMentions} (${mentionCount} mentions)`);
}

main();
