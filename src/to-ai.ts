
import { run } from './childs_p.js';
export function ai(prompt: string, options: {
  tool?: "claude" | "pi"
} = {}) {
  const { tool = "pi" } = options;
  const args = getArgs(tool, prompt)
  run(tool, args, "AI");
}

function getArgs(tool: "claude" | "pi",prompt:string) {
  switch (tool) {
    case 'pi':
      return ["--working-dir",process.cwd(), "--y", prompt]
    case 'claude':
      return [ prompt]
  }
}
