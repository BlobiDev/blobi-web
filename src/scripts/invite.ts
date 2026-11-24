import { lookup } from '../lib/invites.mjs';

const root = document.querySelector<HTMLElement>('[data-invite]');
if (root) {
  const { hash } = location;
  // Drop the token from the address bar, history and any later copy of the URL as soon as it is read.
  if (hash) history.replaceState(null, '', location.pathname + location.search);
  lookup({ api: root.dataset.api, hash, fetchImpl: fetch }).then(({ state, expiresAt }) => {
    root.querySelectorAll<HTMLElement>('[data-state]').forEach((p) => { p.hidden = p.dataset.state !== state; });
    const shown = root.querySelector<HTMLElement>(`[data-state="${state}"]`);
    if (shown && expiresAt) {
      const date = new Intl.DateTimeFormat(root.dataset.lang, { dateStyle: 'long' }).format(new Date(expiresAt));
      shown.textContent = (shown.textContent ?? '').replace('{date}', date);
    }
  });
}
