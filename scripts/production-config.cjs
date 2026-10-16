const { isIP } = require('node:net');

function assertProductionConfig(env = process.env) {
  let api;
  try { api = new URL(env.EXPO_PUBLIC_API_URL); } catch { throw new Error('Production requires EXPO_PUBLIC_API_URL.'); }
  if (api.protocol !== 'https:' || api.username || api.password ||
      isIP(api.hostname) || api.hostname === 'localhost' ||
      api.hostname.endsWith('.localhost') || api.hostname.endsWith('.local')) {
    throw new Error('Production requires a public HTTPS API domain without embedded credentials.');
  }
  if (!env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
    throw new Error('Production requires a Clerk production publishable key (pk_live_).');
  }
}

module.exports = { assertProductionConfig };
