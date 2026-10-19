import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const checker = fileURLToPath(new URL("../../respec-mcp/bin/respec-check.js", import.meta.url));
for (const profile of ["pm-kr-transition", "pm-kr-stereo-adoption"]) {
  const child = spawnSync(process.execPath, [checker, "--repo-root", repoRoot,
    "--profile", profile, "--report", `reports/build/${profile}.check.json`], { stdio: "inherit" });
  if (child.error) console.error(child.error.message);
  process.exitCode = Math.max(process.exitCode || 0, child.status ?? 2);
}
