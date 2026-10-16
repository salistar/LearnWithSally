import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { localDate } from '../lib/local-date.ts';

test('day follows local calendar rather than UTC around midnight', () => {
  // Set TZ before the process starts: test-runner workers do not reliably
  // apply timezone mutations after V8 has initialized on every platform.
  for (const [timezone, instant, expected] of [
    ['Etc/GMT-1', '2026-10-15T23:30:00Z', '2026-10-16'],
    ['Etc/GMT+7', '2026-10-16T02:00:00Z', '2026-10-15'],
  ]) {
    const result = spawnSync(process.execPath, ['--input-type=module','-e',
      `import { localDate } from './lib/local-date.ts'; console.log(localDate(new Date('${instant}')));`],
    { env: { ...process.env, TZ: timezone }, encoding: 'utf8' });
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), expected);
  }
});
test('previous calendar day crosses year and leap-day boundaries', () => {
  assert.equal(localDate(new Date(2026, 0, 1, 0, 30), -1), '2025-12-31');
  assert.equal(localDate(new Date(2024, 2, 1, 12), -1), '2024-02-29');
});
test('date helpers leave the supplied Date unchanged', () => {
  const date = new Date(2026, 9, 16, 0, 30);
  const original = date.getTime();
  localDate(date, -1);
  assert.equal(date.getTime(), original);
});
