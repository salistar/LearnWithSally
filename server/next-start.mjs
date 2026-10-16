import { spawn } from 'node:child_process';
import { loadCredentials } from './load-credentials.mjs';
loadCredentials();
const child = spawn(process.execPath, ['web/server.js'], {
  env:{...process.env,HOSTNAME:'0.0.0.0',PORT:process.env.PORT||'3100'}, stdio:'inherit',
});
child.on('error',()=>process.exit(1));
child.on('exit',code=>process.exit(code??1));
for(const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>child.kill(signal));
