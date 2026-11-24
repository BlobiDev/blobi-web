// Waitlist form settings, read at build time. Empty endpoint = form rendered disabled.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** @param {Record<string, string | undefined>} env */
export function waitlistConfig(env) {
  const endpoint = env.PUBLIC_WAITLIST_ENDPOINT?.trim();
  if (!endpoint) return null;
  let url;
  try { url = new URL(endpoint); } catch { url = null; }
  if (!url || url.protocol !== 'https:' || !url.pathname.endsWith('/subscription/form')) {
    throw new Error(`PUBLIC_WAITLIST_ENDPOINT must be the https URL of Listmonk's /subscription/form, got "${endpoint}"`);
  }
  const lists = { en: env.PUBLIC_WAITLIST_LIST_EN?.trim() ?? '', es: env.PUBLIC_WAITLIST_LIST_ES?.trim() ?? '' };
  for (const [lang, id] of Object.entries(lists)) {
    if (!UUID.test(id)) throw new Error(`PUBLIC_WAITLIST_LIST_${lang.toUpperCase()} must be a Listmonk list UUID, got "${id}"`);
  }
  return { endpoint: url.href, lists };
}
