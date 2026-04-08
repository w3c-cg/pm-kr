import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { listProfiles, scaffoldSource } from "../../respec/tools/respecMcpCore.js";

const repoRoot = path.resolve(".");
const tempRoot = await mkdtemp(path.join(os.tmpdir(), "pm-kr-profile-"));

try {
  const listed = await listProfiles(repoRoot);
  assert.equal(listed.default_profile, "pm-kr");
  assert.ok(listed.profiles.some(profile => profile.profile_id === "pm-kr"));

  const scaffolded = await scaffoldSource(
    {
      repo_root: repoRoot,
      profile: "pm-kr",
      status: "CG-FINAL",
      output: path.relative(repoRoot, path.join(tempRoot, "final.html")),
      overrides: {
        title: "PM-KR Final Smoke",
      },
    },
    {}
  );

  assert.equal(scaffolded.status, "CG-FINAL");
  assert.equal(scaffolded.compliance.valid, true);
  console.log("pm-kr profile smoke passed");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
