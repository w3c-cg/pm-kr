import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { listProfiles, scaffoldSource } from "../../respec-mcp/src/core.js";

const repoRoot = path.resolve(".");
await mkdir(path.join(repoRoot, "reports/build"), { recursive: true });
const tempRoot = await mkdtemp(path.join(repoRoot, "reports/build/profile-smoke-"));

try {
  const listed = await listProfiles(repoRoot);
  assert.equal(listed.default_profile, "pm-kr");
  assert.ok(listed.profiles.some(profile => profile.profile_id === "pm-kr"));

  const scaffolded = await scaffoldSource(
    {
      profile: "pm-kr",
      status: "CG-FINAL",
      output: path.relative(repoRoot, path.join(tempRoot, "final.html")),
      overrides: {
        title: "PM-KR Final Smoke",
      },
    },
    { repoRoot }
  );

  assert.equal(scaffolded.status, "CG-FINAL");
  assert.equal(scaffolded.compliance.valid, true);
  console.log("pm-kr profile smoke passed");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
