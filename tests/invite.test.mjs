import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { invitesApiBase, lookup } from '../src/lib/invites.mjs';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const token = 'A'.repeat(43);
const reply = (status, body) => async () => new Response(JSON.stringify(body), { status });

test('without PUBLIC_INVITES_API the page is unavailable and no request is made', async () => {
  assert.equal(invitesApiBase({}), null);
  assert.equal(invitesApiBase({ PUBLIC_INVITES_API: '  ' }), null);
  let calls = 0;
  const fetchImpl = async () => { calls++; throw new Error('must not be called'); };
  assert.deepEqual(await lookup({ api: null, hash: `#${token}`, fetchImpl }), { state: 'unavailable' });
  assert.equal(calls, 0);
});

test('the API origin must be https (http only on localhost) and a bare origin', () => {
  assert.equal(invitesApiBase({ PUBLIC_INVITES_API: 'https://api.example.org' }), 'https://api.example.org');
  assert.equal(invitesApiBase({ PUBLIC_INVITES_API: 'http://localhost:8787' }), 'http://localhost:8787');
  for (const bad of ['http://api.example.org', 'https://api.example.org/v1', 'https://api.example.org/?x=1', 'api.example.org', 'https://api.example.org/#t']) {
    assert.throws(() => invitesApiBase({ PUBLIC_INVITES_API: bad }), /PUBLIC_INVITES_API/);
  }
});

test('malformed or missing fragments never reach the network', async () => {
  const fetchImpl = async () => { throw new Error('must not be called'); };
  assert.deepEqual(await lookup({ api: 'https://x', hash: '', fetchImpl }), { state: 'missing' });
  assert.deepEqual(await lookup({ api: 'https://x', hash: '#short', fetchImpl }), { state: 'invalid' });
});

test('a valid fragment posts the token in the body, never in the URL', async () => {
  let seen;
  const fetchImpl = async (url, init) => { seen = { url, init }; return new Response(JSON.stringify({ status: 'pending', expires_at: '2026-12-05T00:00:00Z', remaining_uses: 1 })); };
  assert.deepEqual(await lookup({ api: 'https://api.example.org', hash: `#${token}`, fetchImpl }), { state: 'pending', expiresAt: '2026-12-05T00:00:00Z' });
  assert.equal(seen.url, 'https://api.example.org/v1/invites/check');
  assert.ok(!seen.url.includes(token));
  assert.deepEqual(JSON.parse(seen.init.body), { token });
  assert.equal(seen.init.referrerPolicy, 'no-referrer');
  assert.equal(seen.init.credentials, 'omit');
});

test('server answers map to page states', async () => {
  const hash = `#${token}`;
  for (const status of ['used', 'expired', 'revoked', 'invalid']) assert.equal((await lookup({ api: 'https://x', hash, fetchImpl: reply(200, { status }) })).state, status);
  assert.equal((await lookup({ api: 'https://x', hash, fetchImpl: reply(429, {}) })).state, 'busy');
  assert.equal((await lookup({ api: 'https://x', hash, fetchImpl: reply(400, {}) })).state, 'invalid');
  assert.equal((await lookup({ api: 'https://x', hash, fetchImpl: reply(500, {}) })).state, 'error');
  assert.equal((await lookup({ api: 'https://x', hash, fetchImpl: reply(200, { status: 'weird' }) })).state, 'error');
  assert.equal((await lookup({ api: 'https://x', hash, fetchImpl: async () => { throw new TypeError('offline'); } })).state, 'error');
});

test('invitation pages are noindex and no-referrer, and use the translated states', async () => {
  for (const page of ['../src/pages/invite/index.astro', '../src/pages/es/invitacion/index.astro']) {
    assert.match(await read(page), /\bnoindex\b[^>]*\bnoReferrer\b/);
  }
  const layout = await read('../src/components/SiteLayout.astro');
  assert.match(layout, /<meta name="referrer" content="no-referrer"\/>/);
  const component = await read('../src/components/Invite.astro');
  assert.doesNotMatch(component, /https?:\/\//, 'no third-party or hard-coded origins');
  const en = JSON.parse(await read('../src/i18n/en.json')).invite.states;
  const es = JSON.parse(await read('../src/i18n/es.json')).invite.states;
  assert.deepEqual(Object.keys(en), Object.keys(es));
});

test('the waitlist does not depend on the invitation settings', async () => {
  for (const file of ['../src/components/WaitlistForm.astro', '../src/lib/waitlist.mjs']) {
    assert.doesNotMatch(await read(file), /INVITES|invites|invite/i, file);
  }
});
