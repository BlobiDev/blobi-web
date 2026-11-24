import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { parse } from 'yaml';
import { z } from 'zod';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const state = z.enum(['available', 'in-progress', 'planned']);
const localized = z.object({ en: z.string().min(1), es: z.string().min(1) });
const registrySchema = z.object({
  project: z.object({ status: z.enum(['in-progress', 'planned']) }),
  items: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/), chapter: z.enum(['messaging', 'customization', 'privacy', 'server', 'open-source']),
    state, home: z.boolean(), name: localized, summary: localized, detail: localized,
  })).min(1),
});

test('feature registry is localized and only the website privacy statement is available', async () => {
  const registry = registrySchema.parse(parse(await read('../src/content/features/features.yaml')));
  const ids = registry.items.map((feature) => feature.id);
  assert.equal(new Set(ids).size, ids.length, 'feature ids are unique');
  assert.ok(registry.items.filter((feature) => feature.home).length >= 5);
  assert.ok(registry.items.filter((feature) => feature.home && feature.state === 'in-progress' && feature.id !== 'site-privacy').every((feature) => feature.summary.en.includes('prototype')));
  for (const feature of registry.items) {
    if (feature.id === 'site-privacy') assert.equal(feature.state, 'available');
    else assert.notEqual(feature.state, 'available', `${feature.id} cannot claim public availability without a published app preview`);
  }
});

test('EN and ES dictionaries and app demo data stay aligned', async () => {
  const en = JSON.parse(await read('../src/i18n/en.json'));
  const es = JSON.parse(await read('../src/i18n/es.json'));
  const keys = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => typeof child === 'object' && !Array.isArray(child) ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
  assert.deepEqual(keys(en), keys(es));
  assert.equal(es.status.planned, 'Previsto');
  const registry = registrySchema.parse(parse(await read('../src/content/features/features.yaml')));
  const appEn = JSON.parse(await read('../src/content/demo/en.json'));
  const appEs = JSON.parse(await read('../src/content/demo/es.json'));
  const structure = (value) => Object.entries(value).map(([key, child]) => [key, Array.isArray(child) ? child.length : typeof child === 'object' && child !== null ? structure(child) : typeof child]).sort(([a],[b])=>a.localeCompare(b));
  assert.deepEqual(structure(appEn), structure(appEs));
  assert.deepEqual(appEn.tabs.map((tab) => tab.id), ['mika','ana-luz','weekend','general']);
  assert.deepEqual(appEs.tabs.map((tab) => tab.id), ['mika','ana-luz','weekend','general']);
  assert.deepEqual(appEn.contacts.map((person) => person.name), ['Ana Luz','Mika','Nori','Juno','Kai','Pepe','Theo','Sam']);
  assert.equal(appEn.window.profile, 'Sky');
  assert.equal(appEs.window.profile, 'Sky');
  assert.equal(appEn.tabs[2].name, 'Excursión del finde');
  assert.equal(appEn.messages.mika[1].text, 'Hey! Did you see the new Blobi? The tabs look lovely');
  assert.equal(appEs.messages.mika[1].text, '¡Ey! ¿Viste el nuevo Blobi? Las pestañas quedaron preciosas');
  assert.equal('quickReplies' in appEn, false);
  assert.equal('typing' in appEn, false);
  assert.equal('quickReplies' in appEs, false);
  assert.equal('typing' in appEs, false);
  const ids = new Set(registry.items.map((feature) => feature.id));
  for (const locale of [en, es]) {
    assert.ok(locale.home.title.length > 0);
    assert.ok(locale.home.windowsTitle.length > 0);
  }
  assert.ok(ids.has('site-privacy'));
});
