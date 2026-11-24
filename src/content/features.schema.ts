import { z } from 'zod';

const localized = z.object({ en: z.string().min(1), es: z.string().min(1) });
export const featureStateSchema = z.enum(['available', 'in-progress', 'planned']);
export const featureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  chapter: z.enum(['messaging', 'customization', 'privacy', 'server', 'open-source']),
  state: featureStateSchema,
  home: z.boolean(),
  name: localized,
  summary: localized,
  detail: localized,
});
export const registrySchema = z.object({
  project: z.object({ status: z.enum(['in-progress', 'planned']) }),
  items: z.array(featureSchema).min(1),
});
export type Feature = z.infer<typeof featureSchema>;
