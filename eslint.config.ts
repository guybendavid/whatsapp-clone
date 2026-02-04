import { getStrictifyConfig } from "strictify";
import type { StrictifyPresetConfig } from "strictify";

const clientConfig = {
  fileGlobs: ["client/src/**/*.{ts,tsx}"],
  projectConfigPath: "./client/tsconfig.json"
};

const clientPresetConfigs = [
  {
    type: "typescript",
    fileGlobs: clientConfig.fileGlobs
  },
  {
    type: "vite-react",
    fileGlobs: clientConfig.fileGlobs
  }
] satisfies StrictifyPresetConfig<"browser">[];

const serverPresetConfigs = [
  {
    type: "typescript",
    fileGlobs: ["server/**/*.ts", "tests/**/*.ts"]
  }
] satisfies StrictifyPresetConfig<"node">[];

const eslintConfig = [
  ...(await getStrictifyConfig({
    presetConfigs: clientPresetConfigs,
    projectConfigPath: clientConfig.projectConfigPath,
    globalsMode: "browser"
  })),
  ...(await getStrictifyConfig({
    isIncludeRecommendedBaseConfig: false,
    presetConfigs: serverPresetConfigs,
    projectConfigPath: "./server/tsconfig.json",
    globalsMode: "node",
    disallowJsConfig: {
      isEnabled: true,
      ignoredFileGlobs: ["server/db/config/**/*.js", "server/db/migrations/**/*.js", "server/db/seeders/**/*.js"]
    }
  })),
  {
    files: ["server/db/seeders/20201007191119-init-users.js"],
    rules: {
      "eslintImport/no-unresolved": "off"
    }
  },
  {
    files: ["server/graphql/resolvers/resolvers-config.ts"],
    rules: {
      "strictify/get-prefix": [
        "error",
        {
          configLikeVariableNamePatterns: ["^resolversConfig$"]
        }
      ]
    }
  },
  {
    files: ["**/models/*.ts"],
    rules: {
      // To do: enable and refactor
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    rules: {
      // To do: enable and refactor (all)
      "strictify/no-hardcoded-strings": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "no-magic-numbers": "off",
      "@typescript-eslint/ban-ts-comment": "off"
    }
  }
];

export default eslintConfig;
