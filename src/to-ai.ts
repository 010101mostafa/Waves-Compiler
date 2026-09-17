
import { run } from './childs_p.js';
import { config, type ToolType } from './config.js';
export function ai(prompt: string, options: {
  tool?: ToolType
} = {}) {
  const { tool = config.tool } = options;
  const args = getArgs(tool, prompt)
  return run(tool, args, "AI");
}

function getArgs(tool:ToolType, prompt:string) {
  switch (tool) {
    case 'pi':
      return [ "--approve", prompt]
    case 'claude':
      return [prompt]
    case "opencode":
      return [ prompt ]
  }
}
