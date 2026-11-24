// Invitation page logic. The token lives in the URL fragment, which browsers never send to servers.
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const STATES = new Set(['pending', 'used', 'expired', 'revoked', 'invalid']);

/** Build-time setting. Empty = the page explains it is unavailable and makes no requests. */
export function invitesApiBase(env) {
  const raw = env.PUBLIC_INVITES_API?.trim();
  if (!raw) return null;
  let url;
  try { url = new URL(raw); } catch { url = null; }
  const local = url && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  if (!url || (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`PUBLIC_INVITES_API must be an https origin such as https://api.example.org, got "${raw}"`);
  }
  return url.origin;
}

/** Resolves the page state for a URL fragment. Calls the check endpoint only with a well-formed token. */
export async function lookup({ api, hash, fetchImpl }) {
  if (!api) return { state: 'unavailable' };
  const token = hash.replace(/^#/, '');
  if (!token) return { state: 'missing' };
  if (!TOKEN_RE.test(token)) return { state: 'invalid' };
  let res;
  try {
    res = await fetchImpl(`${api}/v1/invites/check`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }),
      referrerPolicy: 'no-referrer', credentials: 'omit', cache: 'no-store',
    });
  } catch { return { state: 'error' }; }
  if (res.status === 429) return { state: 'busy' };
  if (res.status === 400) return { state: 'invalid' };
  if (!res.ok) return { state: 'error' };
  let data;
  try { data = await res.json(); } catch { return { state: 'error' }; }
  if (!STATES.has(data?.status)) return { state: 'error' };
  return { state: data.status, expiresAt: data.expires_at };
}
