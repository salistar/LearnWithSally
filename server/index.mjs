import express from 'express';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
// SDK 54's ESM adapter contains extensionless imports; use its CJS export.
const require = createRequire(import.meta.url);
const { createRequestHandler } = require('expo-server/adapter/express');

const app = express();
app.disable('x-powered-by');
app.get('/healthz', async (_request, response) => {
  try {
    const teacher = await fetch('http://127.0.0.1:8000/ready', { signal: AbortSignal.timeout(2000) });
    response.status(teacher.ok ? 200 : 503).json({ ready: teacher.ok });
  } catch {
    response.status(503).json({ ready: false });
  }
});
app.use(express.static(resolve('dist/client')));
app.use(createRequestHandler({ build: resolve('dist/server') }));
app.listen(Number(process.env.PORT || 10000), '0.0.0.0');
