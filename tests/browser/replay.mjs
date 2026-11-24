// Real-browser check of Replay (not part of `pnpm test`): node tests/browser/replay.mjs <url> <chrome binary>
// Drives headless Chrome over the DevTools protocol (Node >= 22 global WebSocket); no extra dependency.
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [url, chrome = 'google-chrome'] = process.argv.slice(2);
const dir = await mkdtemp(join(tmpdir(), 'replay-'));
const proc = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', `--user-data-dir=${dir}`, '--remote-debugging-port=0', '--window-size=1280,1600', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => { let b = ''; proc.stderr.on('data', (d) => { b += d; const m = b.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('chrome did not start')), 15000); });
const ws = new WebSocket(wsUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}, sessionId) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { result: { targetId } } = await send('Target.createTarget', { url });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId)).result.result.value;
await new Promise((r) => setTimeout(r, 2500));
const script = `(async () => {
  const hero = document.querySelector('[data-app-conversation][data-replica-id="hero"]');
  const count = () => hero.querySelector('[data-message-sequence="mika"]').children.length;
  hero.scrollIntoView(); await new Promise((r) => setTimeout(r, 9000)); // let the first run finish
  const full = count();
  hero.querySelector('[data-app-tab]:not([data-app-tab="mika"])').click(); // leave the Mika tab
  hero.querySelector('[data-replay]').click();
  await new Promise((r) => setTimeout(r, 300));
  const restarted = count();
  const selected = hero.querySelector('[data-app-tab][aria-selected="true"]').dataset.appTab;
  await new Promise((r) => setTimeout(r, 9000));
  return { full, restarted, selected, finished: count() };
})()`;
const r = await ev(script);
console.log(JSON.stringify(r));
ws.close(); proc.kill();
const ok = r.full > 3 && r.restarted < r.full && r.selected === 'mika' && r.finished === r.full;
console.log(ok ? 'PASS replay restarts the real conversation' : 'FAIL');
process.exit(ok ? 0 : 1);
