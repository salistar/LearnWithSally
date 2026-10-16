import assert from 'node:assert/strict';
import { createClerkClient } from '@clerk/backend';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
const origin = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8097';
const clerk = createClerkClient({secretKey:process.env.CLERK_SECRET_KEY});
let user, session;
try {
  assert.ok(process.env.CLERK_SECRET_KEY?.startsWith('sk_test_'), 'Smoke fixtures require a Clerk development instance');
  user = await clerk.users.createUser({emailAddress:[`lws-${Date.now()}+clerk_test@example.com`],skipPasswordRequirement:true});
  session = await clerk.sessions.createSession({userId:user.id});
  const {jwt} = await clerk.sessions.getToken(session.id, undefined, 300);
  const request = (path, options={}) => fetch(`${origin}/api/${path}`,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${jwt}`},signal:AbortSignal.timeout(45_000)});
  const tokenResponse = await request('stream-token');
  assert.equal(tokenResponse.status,200,'Authenticated Stream token route');
  const token = await tokenResponse.json();
  assert.equal(token.userId,user.id);
  assert.ok(token.token && token.apiKey);
  console.log('PASS authenticated Clerk session -> Stream token');
  const denied = await request('agent-session',{method:'POST',body:JSON.stringify({callId:'lesson-es-1-1-user_someone_else'})});
  assert.equal(denied.status,403);
  console.log('PASS foreign call ownership rejected');
  const chat = await request('chat',{method:'POST',body:JSON.stringify({language:'fr',messages:[{role:'user',content:'Say bonjour in one short sentence.'}]})});
  assert.equal(chat.status,200,'Real OpenAI chat request');
  const result = await chat.json();
  assert.ok(result.reply?.length > 0);
  console.log('PASS real OpenAI response through authenticated app API');
  const health = await fetch('http://127.0.0.1:8000/openapi.json',{signal:AbortSignal.timeout(5000)});
  assert.equal(health.status,200);
  console.log('PASS Python teacher HTTP service');
  if (existsSync(resolve('dist/server'))) {
    const server = spawn(process.execPath, ['server/index.mjs'], {
      windowsHide:true, stdio:'ignore', env:{...process.env,PORT:'8098'},
    });
    try {
      let ready = false;
      for(let attempt=0; attempt<40; attempt++) {
        await new Promise(resolve=>setTimeout(resolve,250));
        try { ready = (await fetch('http://127.0.0.1:8098/healthz', {signal:AbortSignal.timeout(2000)})).ok; } catch {}
        if(ready) break;
      }
      assert.ok(ready,'Exported production server starts and teacher is ready');
      const exported = await fetch('http://127.0.0.1:8098/api/stream-token', {
        headers:{Authorization:`Bearer ${jwt}`},signal:AbortSignal.timeout(15_000),
      });
      assert.equal(exported.status,200,'Exported server authenticates Clerk token');
      console.log('PASS exported Express server health and real authenticated API route');
    } finally { server.kill(); }
  }
  if (process.argv.includes('--voice') || process.env.LWS_VOICE_SMOKE === '1') {
    const voice = spawnSync(resolve('vision-agent/.venv/Scripts/python.exe'),['scripts/voice-smoke.py'], {
      encoding:'utf8', windowsHide:true, timeout:300_000,
      env:{...process.env,LWS_TEST_USER:user.id,LWS_TEST_JWT:jwt},
    });
    console.log(voice.stdout?.trim());
    assert.equal(voice.status,0,'Live voice conversation');
  }
  const artifacts = ['LearnWithSally-local.apk','LearnWithSally-local.aab'].map(name=>resolve('../../outputs',name));
  if(artifacts.every(existsSync)) {
    const scan = spawnSync(resolve('vision-agent/.venv/Scripts/python.exe'),['scripts/verify-android-artifacts.py',...artifacts],{encoding:'utf8',windowsHide:true});
    assert.equal(scan.status,0,'Android artifact integrity and secret scan');
    console.log(scan.stdout.trim());
  }
} catch(error) {
  // Do not serialize provider errors or HTTP headers: they may contain secrets.
  console.error(`FAIL service smoke: ${error?.code ?? error?.status ?? error?.name ?? 'unknown'}`);
  process.exitCode=1;
} finally {
  if(session) await clerk.sessions.revokeSession(session.id).catch(()=>{});
  if(user) await clerk.users.deleteUser(user.id).catch(()=>{});
  console.log('Temporary test user/session cleanup attempted');
}
