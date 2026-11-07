// Check every report against the profile reports/README.md says it uses.
// The README's table is the one place that claims a profile per report, so a wrong claim fails here.
// `--list` prints the pairs as JSON for the CI matrix instead of running the checks.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const checker = fileURLToPath(new URL("../../respec-mcp/bin/respec-check.js", import.meta.url));

export function reportPairs(readme) {
  const pairs = [];
  for (const line of readme.split("\n")) {
    const cells = line.split("|").map(cell => cell.trim());
    if (cells.length < 5 || !cells[1].includes("](source/")) continue;
    const source = /\]\(source\/([^)#]+)\)/.exec(cells[1])?.[1];
    const profile = /`([^`]+)`/.exec(cells[3])?.[1];
    if (!source || !profile) throw new Error(`report row without a source or a profile: ${line}`);
    pairs.push({ source: `reports/source/${source}`, profile, name: source.replace(/\.html$/, "") });
  }
  if (pairs.length === 0) throw new Error("reports/README.md lists no report with a check profile");
  return pairs;
}

const pairs = reportPairs(readFileSync(new URL("../reports/README.md", import.meta.url), "utf8"));
if (process.argv.includes("--list")) {
  console.log(JSON.stringify(pairs));
} else {
  for (const { source, profile, name } of pairs) {
    console.log(`\n== ${source} against profile ${profile}`);
    const child = spawnSync(process.execPath, [checker, "--repo-root", repoRoot, "--profile", profile,
      "--report", `reports/build/${name}.check.json`, source], { stdio: "inherit" });
    if (child.error) console.error(child.error.message);
    process.exitCode = Math.max(process.exitCode || 0, child.status ?? 2);
  }
}
