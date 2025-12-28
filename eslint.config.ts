import { configs, getRecommendedTypeScriptConfig, getRecommendedViteReactProjectConfig } from "strictify";

const clientConfig = {
  fileGlobs: ["client/**/*.{ts,tsx}"],
  tsConfigPath: "./client/tsconfig.json",
  importResolverNodePaths: ["client/src"]
};

const [clientTypeScriptConfig, clientReactConfigs, nodeServerConfigs] = await Promise.all([
  getRecommendedTypeScriptConfig({
    globalsMode: "browser",
    ...clientConfig
  }),
  getRecommendedViteReactProjectConfig({
    fileGlobs: clientConfig.fileGlobs,
    projectConfigPath: clientConfig.tsConfigPath,
    importResolverNodePaths: clientConfig.importResolverNodePaths
  }),
  getRecommendedTypeScriptConfig({
    globalsMode: "node",
    fileGlobs: ["server/**/*.ts", "tests/**/*.ts"],
    tsConfigPath: "./server/tsconfig.json",
    disallowJsFiles: true,
    disallowJsIgnoredFileGlobs: ["server/db/config/**/*.js", "server/db/migrations/**/*.js", "server/db/seeders/**/*.js"]
  })
]);

const clientConfigs = [...clientTypeScriptConfig, ...clientReactConfigs];

const eslintConfig = [
  ...clientConfigs,
  ...nodeServerConfigs,
  ...configs.recommendedStyles,
  {
    files: ["server/graphql/resolvers/resolvers-config.ts"],
    rules: {
      "strictify/prefer-get-prefix": [
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
      "no-magic-numbers": "off"
    }
  }
];

export default eslintConfig;
