import { spawn } from 'child_process';
import type { RequestHandler } from 'express';

interface ShellRequest {
  command: string;
  shell_type?: string;
  workdir?: string;
  env?: Record<string, string>;
}

export function createShellExecutor(): RequestHandler {
  return async (req, res) => {
    const { command, shell_type, workdir, env } = req.body as ShellRequest;

    if (!command) {
      res.status(400).json({ error: 'Missing command' });
      return;
    }

    const result = await executeCommand(command, {
      shell: shell_type || true,
      cwd: workdir,
      env: { ...process.env, ...env },
    });

    // Return all outputs for flexible variable saving
    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
      // Legacy: keep "output" as alias for stdout for backward compatibility
      output: result.stdout,
    });
  };
}

interface ExecOptions {
  shell?: string | boolean;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

interface ExecResult {
  stdout: string;
  stderr: string;
  status: number;
}

function executeCommand(command: string, options: ExecOptions): Promise<ExecResult> {
  return new Promise((resolve) => {
    const shell = typeof options.shell === 'string' ? options.shell : '/bin/sh';

    const child = spawn(shell, ['-c', command], {
      cwd: options.cwd,
      env: options.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      // Always resolve with full result, let caller decide how to handle non-zero status
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        status: code ?? 1,
      });
    });

    child.on('error', (err) => {
      resolve({
        stdout: '',
        stderr: err.message,
        status: 1,
      });
    });
  });
}
