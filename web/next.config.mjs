import { fileURLToPath } from 'node:url';
export default {
  output: 'standalone',
  outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.LWS_API_INTERNAL || 'http://127.0.0.1:8097'}/api/:path*` }];
  },
};
