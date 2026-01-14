import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');
const FIXTURES_PATH = join(__dirname, 'fixtures');
const TEMP_DIR = join(__dirname, 'temp');

// Helper to wait for server to be ready
async function waitForServer(url: string, timeout = 10000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return false;
}

// Helper to run CLI command and get output
function runCli(args: string[], timeout = 30000): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      cwd: process.cwd(),
      timeout,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => { stdout += data.toString(); });
    proc.stderr?.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 1 });
    });

    proc.on('error', (err) => {
      resolve({ stdout, stderr: err.message, exitCode: 1 });
    });
  });
}

describe('CLI Commands', () => {
  beforeAll(() => {
    // Ensure temp directory exists
    if (!existsSync(TEMP_DIR)) {
      mkdirSync(TEMP_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up temp directory
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  });

  describe('demoscript serve', () => {
    let serverProcess: ChildProcess | null = null;

    afterAll(() => {
      if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
      }
    });

    it('starts server on specified port', async () => {
      const port = 4567;
      const demoPath = join(FIXTURES_PATH, 'valid-demo');

      serverProcess = spawn('node', [CLI_PATH, 'serve', demoPath, '-p', String(port)], {
        detached: false,
      });

      const serverReady = await waitForServer(`http://localhost:${port}/api/demo`);
      expect(serverReady).toBe(true);

      // Clean up
      serverProcess.kill();
      serverProcess = null;
    }, 15000);

    it('fails on invalid YAML', async () => {
      const demoPath = join(FIXTURES_PATH, 'invalid-yaml');
      const result = await runCli(['serve', demoPath, '-p', '4568']);

      // Should fail to start due to invalid YAML
      expect(result.exitCode).not.toBe(0);
    }, 10000);
  });

  describe('demoscript --help', () => {
    it('shows help information', async () => {
      const result = await runCli(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('serve');
    });
  });
});
