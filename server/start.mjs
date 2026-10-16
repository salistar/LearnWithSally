import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import productionConfig from '../scripts/production-config.cjs';

productionConfig.assertProductionConfig();
for (const name of ['CLERK_SECRET_KEY', 'STREAM_API_KEY', 'STREAM_API_SECRET', 'OPENAI_API_KEY']) {
  if (!process.env[name]) throw new Error(`Missing runtime variable: ${name}`);
}
if (!process.env.CLERK_SECRET_KEY.startsWith('sk_live_')) throw new Error('Production requires a Clerk production secret.');

// The unauthenticated Python control API remains on loopback inside this container.
const env = { ...process.env, VISION_AGENT_URL: 'http://127.0.0.1:8000' };
const children = [
  spawn(resolve('vision-agent/.venv/bin/python'), ['main.py', 'serve', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: resolve('vision-agent'), env, stdio: 'ignore',
  }),
  spawn(process.execPath, ['server/index.mjs'], { env, stdio: 'ignore' }),
];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 3000);
}
children.forEach((child, index) => {
  child.on('error', () => { console.error(`Service ${index} failed to start`); stop(1); });
  child.on('exit', code => { if (!stopping) { console.error(`Service ${index} exited (${code})`); stop(1); } });
});
process.on('SIGTERM', () => stop(0));
process.on('SIGINT', () => stop(0));
