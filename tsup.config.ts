import { defineConfig } from "tsup";
import fs from "fs/promises";
import JavaScriptObfuscator from "javascript-obfuscator";
import path from "path";
export default defineConfig({
  entry: ["src/index.ts","src/cmd"],
  format: ["esm"],
  outDir: "./.dist",
  clean: true,

  // 1. Bundle dependencies into the build output
  noExternal: [/.*/],

  // 2. Disable source map evaluation for external node_modules assets
  sourcemap: false,

  // 3. Configure default loaders for standard extensions
  loader: {
    ".json": "json",
    ".txt": "text",
    ".html": "text",
    ".wasm": "binary",
  },
  async onSuccess() {
    const distDir = path.resolve("./.dist");
    const jsFiles = fs.glob([distDir+"/*.js",distDir+"/**/*.js"]);
    console.log("starting Obfuscating Code")
    for await (const filePath of jsFiles) {
      try {
        console.log("filePath:",filePath)
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
          "utf-8",
        );
        console.log(` Obfuscated: ${path.relative(distDir, filePath)}`);
      } catch (err) {
        console.error(" Obfuscation failed:", err);
      }
    }
  },
});
