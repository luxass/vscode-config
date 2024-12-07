import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  external: ["vscode"],
  treeshake: true,
  clean: true,
  outExtension(ctx) {
    return {
      js: ctx.format === "cjs" ? ".cjs" : ".mjs",
    };
  },
});
