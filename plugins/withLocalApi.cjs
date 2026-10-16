const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = function withLocalApi(config) {
  let api;
  try { api = new URL(process.env.EXPO_PUBLIC_API_URL); } catch { return config; }
  // Release APKs may use adb reverse for local testing. Permit HTTP only to
  // the configured loopback host; HTTPS remains required everywhere else.
  if (api.protocol !== 'http:' || !['127.0.0.1', 'localhost', '10.0.2.2'].includes(api.hostname)) return config;
  config = withAndroidManifest(config, result => {
    result.modResults.manifest.application[0].$['android:networkSecurityConfig'] = '@xml/local_api_security';
    return result;
  });
  return withDangerousMod(config, ['android', async result => {
    const directory = path.join(result.modRequest.platformProjectRoot, 'app/src/main/res/xml');
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'local_api_security.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<network-security-config><base-config cleartextTrafficPermitted="false"/><domain-config cleartextTrafficPermitted="true"><domain includeSubdomains="false">${api.hostname}</domain></domain-config></network-security-config>\n`);
    return result;
  }]);
};
