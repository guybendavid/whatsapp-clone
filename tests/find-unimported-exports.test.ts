import { execSync } from "child_process";
import { join } from "path";
import { test } from "node:test";
import { writeFileSync, unlinkSync } from "fs";
import assert from "node:assert";

const cwd = process.cwd();
const testFixturePath = join(cwd, "tests", "test-fixture-unused-export.ts");

const getScriptResult = () => {
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

test("find-unimported-exports detects unimported exports", () => {
  writeFileSync(testFixturePath, "export const unusedTestExport = 42;");

  try {
    const { output, exitCode } = getScriptResult();

    assert.strictEqual(exitCode, 1, "Script should exit with code 1 when unimported exports exist");
    assert.ok(output.includes("unusedTestExport"), "Output should contain the unused export name");
    assert.ok(output.includes("test-fixture-unused-export.ts"), "Output should contain the file name");
  } finally {
    unlinkSync(testFixturePath);
  }
});
