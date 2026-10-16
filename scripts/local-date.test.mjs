import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localDate } from '../lib/local-date.ts';

test('day follows local calendar rather than UTC around midnight', () => {
  process.env.TZ = 'Africa/Casablanca';
  assert.equal(localDate(new Date('2026-10-15T23:30:00Z')), '2026-10-16');
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
