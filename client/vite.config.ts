import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: __dirname,
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) {
            return null;
          }

          if (id.includes("react")) {
            return "react";
          }

          if (["@apollo/client", "graphql"].some((needle) => id.includes(needle))) {
            return "graphql";
          }

          if (id.includes("@material-ui")) {
            return "mui";
          }

          if (id.includes("@emotion")) {
            return "emotion";
          }

          return "vendor";
        }
      }
    }
  }
});
