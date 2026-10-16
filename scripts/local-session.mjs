import http from 'node:http';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('..', import.meta.url));
const values = {};
const names = ['CLERK_SECRET_KEY','STREAM_API_KEY','STREAM_API_SECRET','OPENAI_API_KEY'];
const children = [];
const statuses = {};
const logs = {};
const server = http.createServer(async (req,res) => {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'");
  if (req.headers.host !== '127.0.0.1:8791') { res.writeHead(403).end(); return; }
  if(req.method === 'POST') {
    if(req.headers.origin !== 'http://127.0.0.1:8791') {res.writeHead(403).end();return;}
    let body = ''; for await(const c of req) { body += c; if(body.length > 16000) {res.writeHead(413).end();return;} }
    const form = new URLSearchParams(body);
    for(const name of names) if(form.get(name)) values[name] = form.get(name);
    const action = form.get('action');
    if(action === 'start' || action === 'check') {
      if(action === 'start') {
        for (const child of children) child.kill();
        children.length = 0;
      }
      const env = {...process.env,...values,CI:'1'};
      // Keep Metro watch mode enabled for real local development.
      delete env.CI;
      const tasks = action === 'check' ? [
        ['providers',process.execPath,['scripts/check-env.mjs'],cwd],
        ['smoke',process.execPath,['scripts/smoke-services.mjs'],cwd],
        ['native-auth',process.execPath,['scripts/configure-clerk-native.mjs'],cwd],
      ] : [
        ['metro',process.execPath,['node_modules/expo/bin/cli','start','--localhost','--port','8097','--max-workers','2'],cwd],
        ['teacher',resolve(cwd,'vision-agent/.venv/Scripts/python.exe'),['main.py','serve','--host','127.0.0.1','--port','8000'],resolve(cwd,'vision-agent')]
      ];
      for(const [name,exe,args,dir] of tasks) {
        const child = spawn(exe,args,{cwd:dir,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
        children.push(child); statuses[name] = 'starting';
        child.on('error',()=>statuses[name]='failed'); child.on('exit',code=>statuses[name]=`exited ${code}`);
        // Never persist output: dependencies may log credentials in errors.
        const capture = chunk => {
          let line = chunk.toString();
          for (const value of Object.values(values)) if(value) line = line.split(value).join('[REDACTED]');
          line = line.replace(/sk-[A-Za-z0-9_-]+|sk_(?:test|live)_[A-Za-z0-9_-]+/g,'[REDACTED]');
          logs[name] = ((logs[name] ?? '') + line).slice(-5000);
        };
        child.stdout.on('data',chunk=>{statuses[name]='running';capture(chunk);}); child.stderr.on('data',capture);
      }
    }
    res.writeHead(303,{Location:'/'}).end();return;
  }
  if(req.url === '/status') {res.setHeader('Content-Type','application/json');res.end(JSON.stringify({configured:names.filter(n=>!!values[n]),services:statuses,logs}));return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(`<!doctype html><title>LearnWithSally — session locale</title><style>body{font:18px system-ui;max-width:700px;margin:50px auto}label,input{display:block}input{width:100%;margin:8px 0 20px;padding:8px}button{padding:12px}</style><h1>LearnWithSally — session locale</h1><p>Secrets en mémoire uniquement. Aucun fichier ni journal de secrets. Services limités à localhost.</p><p>${names.map(n=>n+': '+(values[n]?'configuré':'à renseigner')).join('<br>')}</p><p>${JSON.stringify(statuses)}</p><form method="post" autocomplete="off">${names.map(n=>`<label>${n}<input type="password" name="${n}" aria-label="${n}" autocomplete="off"></label>`).join('')}<button name="action" value="save">Charger en mémoire</button><button name="action" value="start">Démarrer les services</button><button name="action" value="check">Vérifier les services</button></form>`);
});
server.listen(8791,'127.0.0.1',()=>console.log('Session locale http://127.0.0.1:8791'));
process.on('SIGINT',()=>{children.forEach(c=>c.kill());server.close();});
