// Checks that .env is complete and that each key really works.
// Usage: npm run check:env      (never prints the secret values)
import { readFileSync, existsSync } from "node:fs";
import { createHmac } from "node:crypto";

const ok = (m) => console.log(`  \x1b[32m✔\x1b[0m ${m}`);
const ko = (m) => console.log(`  \x1b[31m✖\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);

const env = Object.fromEntries(
  (existsSync(".env") ? readFileSync(".env", "utf8") : "")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
// A process-only session or CI may supply secrets without an environment file.
Object.assign(env, process.env);
const timedFetch = (url, init = {}) => fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });

let failures = 0;
const fail = (m) => {
  failures++;
  ko(m);
};

async function check(name, fn) {
  console.log(`\n${name}`);
  try {
    await fn();
  } catch (err) {
    fail(`${name}: ${err instanceof Error ? err.message : err}`);
  }
}

await check("Clerk", async () => {
  const pk = env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sk = env.CLERK_SECRET_KEY ?? "";
  if (!/^pk_(test|live)_/.test(pk)) return fail("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_test_ or pk_live_");
  ok("publishable key format");
  if (!/^sk_(test|live)_/.test(sk)) return fail("CLERK_SECRET_KEY must start with sk_test_ or sk_live_");
  if (pk.split("_")[1] !== sk.split("_")[1]) warn("publishable and secret keys are from different environments (test/live)");
  const res = await timedFetch("https://api.clerk.com/v1/jwks", { headers: { Authorization: `Bearer ${sk}` } });
  if (!res.ok) return fail(`secret key rejected by Clerk (HTTP ${res.status})`);
  ok("secret key accepted by Clerk API");
  const frontendApi = Buffer.from(pk.split("_")[2] ?? "", "base64").toString().replace(/\$$/, "");
  const env2 = await timedFetch(`https://${frontendApi}/v1/environment`).catch(() => null);
  if (env2?.ok) ok(`publishable key points to ${frontendApi}`);
  else warn("could not reach the Clerk frontend API from this machine");
});

await check("Stream", async () => {
  const key = env.STREAM_API_KEY ?? "";
  const secret = env.STREAM_API_SECRET ?? "";
  if (!key || key === "xxx") return fail("STREAM_API_KEY missing");
  if (!secret || secret === "xxx") return fail("STREAM_API_SECRET missing");
  // Server-side token, same format as app/api/stream-token+api.ts
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ server: true, iat: now - 30, exp: now + 300 })}`;
  const token = `${unsigned}.${createHmac("sha256", secret).update(unsigned).digest("base64url")}`;
  const res = await timedFetch(`https://video.stream-io-api.com/api/v2/video/calltypes?api_key=${encodeURIComponent(key)}`, {
    headers: { Authorization: token, "stream-auth-type": "jwt" },
  });
  if (!res.ok) return fail(`Stream rejected the key/secret (HTTP ${res.status})`);
  const data = await res.json();
  ok("key + secret accepted by Stream Video API");
  if (data.call_types?.default) ok('call type "default" exists');
  else fail('call type "default" not found in this Stream app');
});

await check("OpenAI", async () => {
  const key = env.OPENAI_API_KEY ?? "";
  if (!key.startsWith("sk-")) return fail("OPENAI_API_KEY must start with sk-");
  const res = await timedFetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) return fail(`key rejected by OpenAI (HTTP ${res.status})`);
  const ids = ((await res.json()).data ?? []).map((m) => m.id);
  ok("key accepted by OpenAI");
  const realtime = ids.filter((id) => id.includes("realtime"));
  if (realtime.length) ok(`Realtime models available (${realtime.slice(0, 3).join(", ")}…)`);
  else fail("no Realtime model available on this project — Sally's voice will not work");
  const chatModel = env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
  if (ids.includes(chatModel)) ok(`chat model ${chatModel} available`);
  else warn(`chat model ${chatModel} not listed — set OPENAI_CHAT_MODEL in .env`);
});

await check("PostHog (optional)", async () => {
  const token = env.POSTHOG_PROJECT_TOKEN ?? "";
  if (!token || token.startsWith("phc_xxx")) return warn("not configured — analytics disabled");
  if (!token.startsWith("phc_")) return fail("POSTHOG_PROJECT_TOKEN must start with phc_");
  const host = (env.POSTHOG_HOST ?? "").replace(/\/$/, "");
  if (!/^https:\/\/(eu|us)\.i\.posthog\.com$/.test(host)) warn(`POSTHOG_HOST is "${host}" — usually https://eu.i.posthog.com`);
  ok("token format");
});

console.log(failures ? `\n\x1b[31m${failures} problem(s) to fix.\x1b[0m` : "\n\x1b[32mEverything is ready.\x1b[0m");
process.exit(failures ? 1 : 0);
