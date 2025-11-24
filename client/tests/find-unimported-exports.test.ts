import { test } from "node:test";
import assert from "node:assert";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const testFixturePath = join(cwd, "tests", "test-fixture-unused-export.ts");

const runScript = () => {
  try {
    const output = execSync("npx tsx find-unimported-exports.ts", {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });

    return { output, exitCode: 0 };
  } catch (error) {
    const err = error as { stderr?: string; stdout?: string; status?: number };
    return { output: err.stderr || err.stdout || "", exitCode: err.status ?? 1 };
  }
};

test("find-unimported-exports detects unused exports", () => {
  writeFileSync(testFixturePath, "export const unusedTestExport = 42;");

  try {
    const { output, exitCode } = runScript();

    assert.strictEqual(exitCode, 1, "Script should exit with code 1 when unused exports exist");
    assert.ok(output.includes("unusedTestExport"), "Output should contain the unused export name");
    assert.ok(output.includes("test-fixture-unused-export.ts"), "Output should contain the file name");
  } finally {
    unlinkSync(testFixturePath);
  }
});
