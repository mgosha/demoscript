#!/usr/bin/env node

import { Command } from 'commander';
import { serve } from './commands/serve.js';

const program = new Command();

program
  .name('demoscript')
  .description('Framework for creating scripted, shareable product demonstrations')
  .version('0.1.0');

program
  .command('serve <demo>')
  .description('Start dev server for live demo presentation')
  .option('-p, --port <port>', 'Port to run server on', '3000')
  .option('-H, --host [host]', 'Host to bind to (use --host for 0.0.0.0)')
  .option('--no-open', 'Do not open browser automatically')
  .option('-w, --watch', 'Watch demo files for changes and reload')
  .action(async (demo: string, options: { port: string; host?: string | boolean; open: boolean; watch?: boolean }) => {
    const host = options.host === true ? '0.0.0.0' : (typeof options.host === 'string' ? options.host : undefined);
    await serve(demo, { port: parseInt(options.port, 10), host, open: options.open, watch: options.watch });
  });

program.parse();
