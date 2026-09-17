
import * as fs from 'fs';
import * as path from 'path';
import { ai } from './to-ai.js';
import { config, root, type ToolType } from './config.js';
export function start(options: {
  usePi?: boolean,
  useClaude?: boolean,
  useOpencode?: boolean
}) {

  const tool = options.usePi ? "pi" :
    options.useClaude ? "claude" :
      options.useOpencode ? "opencode" : config.tool
  config.tool = tool;

  configerAi(tool)
  console.log("ai cli configerd")
  return ai("/resume", {
    tool
  })
}

function configerAi(tool:ToolType):void {

  // 2. Setup paths and task names
  const taskDir = path.resolve(process.cwd());
  const taskName = path.basename(taskDir);

  console.log(`use ai in cli by Waves Compiler.`);
  console.log(`task Name : ${taskName}`);
  console.log(`issue directory : ${taskDir}`);
  console.log(`use : ${tool}`);

  // 4. Clean up previous copilot data if exists
  const aiDirTarget = path.join(taskDir, "."+tool);

  // 5. Setup directories and symlinks
  const zedSrc = path.join(root, 'vscode');
  const vscodeTarget = path.join(taskDir, '.vscode');
  const logsDir = path.join(taskDir, '.logs');

  if (fs.existsSync(zedSrc)) {
    if (fs.existsSync(vscodeTarget)) {
      fs.rmSync(vscodeTarget, { recursive: true, force: true });
    }
    fs.symlinkSync(zedSrc, vscodeTarget, 'junction');
  }

  fs.mkdirSync(logsDir, { recursive: true });

  const aiSrc = path.join(root, 'AI');
  const env = config.skillsDir;
  if (fs.existsSync(aiDirTarget)) {
    fs.rmSync(aiDirTarget, { recursive: true, force: true });
  }
  symlinkDirFiles(aiSrc, aiDirTarget);
  symlinkDirFiles(env, aiDirTarget);
  const child_processes = path.join(taskDir,"child_processes.md")
  if (!fs.existsSync(child_processes))
    fs.writeFileSync(child_processes, C_P_T,"utf-8")
}

const C_P_T = `
| pid | name |log file | to kill |
|-----|------|---------|---------|
`;


function symlinkDirFiles(sourceDir: string, targetDir: string) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const node of fs.globSync(path.join(sourceDir, '**/*'),{
    withFileTypes:true
  })) {
    const source = path.join(node.parentPath,node.name);
    const relative = path.relative(sourceDir, source);
    const target = path.join(targetDir, relative);
    if(node.isDirectory()){
      fs.mkdirSync(target, { recursive: true });
    }
    else if (!fs.existsSync(target)) {
      fs.symlinkSync(source, target);
    }

  }
}