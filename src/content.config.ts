import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { registry } from './content/features/registry';
import theme from './content/themes/blobi.json';
import en from './content/demo/en.json';
import es from './content/demo/es.json';
import { featureSchema } from './content/features.schema';

const features = defineCollection({ loader: () => registry.items, schema: featureSchema });
const themes = defineCollection({ loader: () => [theme], schema: z.any() });
const demo = defineCollection({
  loader: () => [{ id: 'en', ...en }, { id: 'es', ...es }],
  schema: z.any(),
});

export const collections = { features, themes, demo };
