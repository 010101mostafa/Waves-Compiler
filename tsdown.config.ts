import { defineConfig } from "tsdown";
import fs from "node:fs/promises";
import path from "node:path";
import JavaScriptObfuscator from "javascript-obfuscator";

export default defineConfig({
  entry: ["src/index.ts", "src/cmd/*.ts"],
  format: ["esm"],
  outDir: "./.dist",
  clean: true,
  outExtensions: () => ({ js: ".js" }),

  // 1. Bundle all dependencies into output
  noExternal: [/.*/],

  // 2. Disable sourcemaps
  sourcemap: false,

  // 3. Post-build hook for obfuscation
  async onSuccess() {
    const distDir = path.resolve("./.dist");
    const jsFiles = fs.glob([
      path.join(distDir, "*.js"),
      path.join(distDir, "**/*.js"),
    ]);

    console.log("Starting code obfuscation...");

    for await (const filePath of jsFiles) {
      try {
        const code = await fs.readFile(filePath, "utf-8");

        const obfuscatedResult = JavaScriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          stringArray: true,
          stringArrayThreshold: 0.75,
          target: "node",
        });

        await fs.writeFile(
          filePath,
          obfuscatedResult.getObfuscatedCode(),
          "utf-8"
        );
        console.log(`Obfuscated: ${path.relative(distDir, filePath)}`);
      } catch (err) {
        console.error(`Obfuscation failed for ${filePath}:`, err);
      }
    }
  },
});