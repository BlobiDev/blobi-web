import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { replaysMainConversation } from '../src/lib/replay.mjs';

const root = (children) => ({ contains: (node) => children.includes(node) });

test('a Replay button inside the hero conversation restarts the demo', () => {
  const button = {};
  assert.equal(replaysMainConversation(button, root([button])), true);
});

test('a Replay button outside the hero conversation, or without a conversation, does not', () => {
  assert.equal(replaysMainConversation({}, root([])), false);
  assert.equal(replaysMainConversation({}, null), false);
});

test('home.ts wires every [data-replay] button through that predicate (regression: the condition was inverted)', async () => {
  const source = await readFile(new URL('../src/scripts/home.ts', import.meta.url), 'utf8');
  assert.match(source, /replaysMainConversation\(button,\s*mainConversation\)\)\s*void playConversation\(\)/);
  assert.doesNotMatch(source, /if\(!mainConversation\?\.contains\(button\)\)/);
});
