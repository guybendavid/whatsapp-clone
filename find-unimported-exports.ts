import { promises } from "fs";
import { join } from "path";
import { sync as globSync } from "glob";
import { parse } from "@babel/parser";
import { traverse } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import type { ExportNamedDeclaration } from "@babel/types";

interface ExportInfo {
  file: string;
  isUsed: boolean;
  line: number;
}

const cwd = process.cwd();
const exports: Record<string, ExportInfo> = {};

const getAST = async ({ file }: { file: string }) =>
  parse(await promises.readFile(join(cwd, file), "utf8"), {
    sourceType: "module",
    plugins: ["jsx", "typescript"]
  });

const analyzeExports = async ({ file }: { file: string }) => {
  const ast = await getAST({ file });

  traverse(ast, {
    ExportNamedDeclaration: (path: NodePath<ExportNamedDeclaration>) => {
      const { declaration, loc } = path.node;
      const declarations = (declaration as { declarations?: Array<{ id: any }> })?.declarations;
      const line = loc?.start.line ?? 0;

      declarations?.forEach(({ id }) => {
        // Handle destructured exports: export const { User, Message } = models;
        if (id.type === "ObjectPattern") {
          id.properties?.forEach((prop: any) => {
            if (prop.type === "ObjectProperty" && prop.key?.name) {
              exports[prop.key.name] = { file, isUsed: false, line };
            }
          });

          return;
        }

        // Handle regular exports: export const User = ...;
        if (id.name) {
          exports[id.name] = { file, isUsed: false, line };
        }
      });
    }
  });
};

const analyzeUsage = async ({ file }: { file: string }) => {
  const ast = await getAST({ file });

  traverse(ast, {
    ImportSpecifier: ({ node }) => {
      const { name } = node.imported as { name: string };

      if (exports[name]) {
        exports[name].isUsed = true;
      }
    }
  });
};

const main = async () => {
  try {
    const files = globSync("{client,server,tests}/**/*.{js,jsx,ts,tsx}", {
      cwd,
      ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"]
    });

    await Promise.all(files.map((file) => analyzeExports({ file })));
    await Promise.all(files.map((file) => analyzeUsage({ file })));

    const unusedExports = Object.entries(exports)
      .filter(([, { isUsed }]) => !isUsed)
      .map(([name, { file, line }]) => ({ name, file, line }));

    if (unusedExports.length > 0) {
      console.error("Unimported Exports:");
      unusedExports.forEach(({ name, file, line }) => console.error(`${name} (${file}:${line})`));
      process.exit(1);
    }

    console.log("No unimported exports found");
  } catch (error) {
    console.error("error:", error);
    process.exit(1);
  }
};

main();
