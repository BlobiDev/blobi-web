import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { registrySchema } from '../features.schema';

const source = readFileSync(resolve(process.cwd(), 'src/content/features/features.yaml'), 'utf8');
export const registry = registrySchema.parse(parse(source));
const ids = new Set<string>();
for (const feature of registry.items) {
  if (ids.has(feature.id)) throw new Error(`Duplicate feature id: ${feature.id}`);
  ids.add(feature.id);
}
if (registry.items.filter((feature) => feature.state === 'available').some((feature) => feature.id !== 'site-privacy')) {
  throw new Error('Only the website privacy statement may be marked available.');
}
