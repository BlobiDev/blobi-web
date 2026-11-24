import assert from 'node:assert/strict';
import { test } from 'node:test';
import { waitlistConfig } from '../src/lib/waitlist.mjs';

const en = '11111111-2222-3333-4444-555555555555';
const es = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

test('waitlist stays disabled without an endpoint', () => {
  assert.equal(waitlistConfig({}), null);
  assert.equal(waitlistConfig({ PUBLIC_WAITLIST_ENDPOINT: '  ' }), null);
});

test('waitlist accepts a Listmonk form URL with both list UUIDs', () => {
  const config = waitlistConfig({ PUBLIC_WAITLIST_ENDPOINT: 'https://list.example.org/subscription/form', PUBLIC_WAITLIST_LIST_EN: en, PUBLIC_WAITLIST_LIST_ES: es });
  assert.deepEqual(config, { endpoint: 'https://list.example.org/subscription/form', lists: { en, es } });
});

test('waitlist rejects unsafe or incomplete settings', () => {
  const lists = { PUBLIC_WAITLIST_LIST_EN: en, PUBLIC_WAITLIST_LIST_ES: es };
  for (const endpoint of ['http://list.example.org/subscription/form', 'https://list.example.org/api/public/subscription', '/subscription/form', 'nonsense']) {
    assert.throws(() => waitlistConfig({ PUBLIC_WAITLIST_ENDPOINT: endpoint, ...lists }), /PUBLIC_WAITLIST_ENDPOINT/);
  }
  assert.throws(() => waitlistConfig({ PUBLIC_WAITLIST_ENDPOINT: 'https://list.example.org/subscription/form', PUBLIC_WAITLIST_LIST_EN: en }), /PUBLIC_WAITLIST_LIST_ES/);
  assert.throws(() => waitlistConfig({ PUBLIC_WAITLIST_ENDPOINT: 'https://list.example.org/subscription/form', PUBLIC_WAITLIST_LIST_EN: 'x', PUBLIC_WAITLIST_LIST_ES: es }), /PUBLIC_WAITLIST_LIST_EN/);
});
