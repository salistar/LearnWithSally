import { readFileSync } from 'node:fs';
export function loadCredentials() {
  const file = process.env.LWS_CREDENTIAL_FILE;
  if (!file) return;
  const values = JSON.parse(readFileSync(file, 'utf8'));
  for (const name of ['CLERK_SECRET_KEY','STREAM_API_KEY','STREAM_API_SECRET','OPENAI_API_KEY']) {
    if (typeof values[name] !== 'string' || !values[name]) throw new Error(`Missing encrypted credential: ${name}`);
    process.env[name] = values[name];
  }
}
