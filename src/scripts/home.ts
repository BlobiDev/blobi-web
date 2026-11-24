import demoEn from '../content/demo/en.json';
import demoEs from '../content/demo/es.json';
import { replaysMainConversation } from '../lib/replay.mjs';
import { appThemeStyle, isAppTheme, DEFAULT_APP_THEME, type AppThemeId, type AppThemeVariant } from '../lib/app-theme';

const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
const demo = lang === 'es' ? demoEs : demoEn;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const home = document.querySelector<HTMLElement>('[data-home]');
const mainConversation = document.querySelector<HTMLElement>('[data-app-conversation][data-replica-id="hero"]');

function setPresence(state: string): void {
  if (!['online', 'away', 'busy', 'invisible'].includes(state)) return;
  for (const contacts of document.querySelectorAll<HTMLElement>('[data-app-contacts]')) {
    contacts.dataset.presence = state;
    const profileAvatar = contacts.querySelector<HTMLElement>('.profile-card .blob-avatar');
    if (profileAvatar) profileAvatar.dataset.presence = state === 'invisible' ? 'offline' : state;
  }
  document.querySelectorAll<HTMLElement>('[data-presence-control]').forEach((control) => {
    control.dataset.presence = state;
    const label = control.querySelector<HTMLElement>('[data-current-presence]');
    if (label) label.textContent = demo.presence[state as keyof typeof demo.presence];
    for (const option of control.querySelectorAll<HTMLButtonElement>('[data-presence-option]')) {
      const selected = option.dataset.presenceOption === state;
      option.setAttribute('aria-checked', String(selected));
      option.tabIndex = selected ? 0 : -1;
    }
  });
  if (home) {
    home.dataset.presence = state;
    const heroAvatar = home.querySelector<HTMLElement>('.hero-mascot img');
    if (heroAvatar) heroAvatar.dataset.mood = state;
  }
}

function closeMenus(restore?: HTMLButtonElement): void {
  document.querySelectorAll<HTMLElement>('[data-presence-menu]').forEach((menu) => { menu.hidden = true; });
  document.querySelectorAll<HTMLButtonElement>('[data-presence-trigger]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
  restore?.focus();
}

for (const control of document.querySelectorAll<HTMLElement>('[data-presence-control]')) {
  const trigger = control.querySelector<HTMLButtonElement>('[data-presence-trigger]');
  const menu = control.querySelector<HTMLElement>('[data-presence-menu]');
  const options = Array.from(control.querySelectorAll<HTMLButtonElement>('[data-presence-option]'));
  trigger?.addEventListener('click', () => {
    const opening = menu?.hidden ?? false;
    closeMenus();
    if (!opening || !menu || !trigger) return;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    (options.find((option) => option.getAttribute('aria-checked') === 'true') ?? options[0])?.focus();
  });
  options.forEach((option, index) => {
    option.addEventListener('click', () => {
      setPresence(option.dataset.presenceOption ?? 'online');
      closeMenus(trigger ?? undefined);
    });
    option.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % options.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = options.length - 1;
      else if (event.key === 'Escape') { event.preventDefault(); closeMenus(trigger ?? undefined); return; }
      else return;
      event.preventDefault(); options[next]?.focus();
    });
  });
}

for (const contacts of document.querySelectorAll<HTMLElement>('[data-app-contacts]')) {
  contacts.querySelectorAll<HTMLElement>('[data-group-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.contact-group')?.querySelector<HTMLElement>('ul');
      if (!group) return;
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded));
      group.hidden = !expanded;
    });
  });
  contacts.querySelector<HTMLInputElement>('[data-contact-search]')?.addEventListener('input', (event) => {
    const query = (event.currentTarget as HTMLInputElement).value.trim().toLocaleLowerCase(lang);
    contacts.querySelectorAll<HTMLElement>('[data-contact-item]').forEach((item) => {
      item.hidden = !item.dataset.contactSearchText?.toLocaleLowerCase(lang).includes(query);
    });
  });
  contacts.querySelector<HTMLButtonElement>('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = contacts.dataset.themeVariant === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

let currentTheme: AppThemeId = DEFAULT_APP_THEME;
let currentVariant: AppThemeVariant = 'light';
const THEME_KEY = 'blobi-site-app-theme';

function paintReplicas(): void {
  document.querySelectorAll<HTMLElement>('[data-app-copy], [data-app-contacts]').forEach((node) => {
    node.dataset.appTheme = currentTheme;
    node.dataset.themeVariant = currentVariant;
    node.style.cssText = appThemeStyle(currentVariant, currentTheme);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    const dark = currentVariant === 'dark';
    // Live Nostalgia Modern has a single light look; the light/dark toggle belongs to the Blobi theme.
    button.hidden = currentTheme !== 'blobi';
    button.dataset.variant = currentVariant;
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? demo.window.themeLight : demo.window.themeDark);
    button.textContent = dark ? demo.window.themeLightShort : demo.window.themeDarkShort;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-theme-choice]').forEach((option) => {
    const selected = option.dataset.themeChoice === currentTheme;
    option.setAttribute('aria-checked', String(selected));
    option.tabIndex = selected ? 0 : -1;
  });
}

function applyTheme(variant: AppThemeVariant): void {
  currentVariant = variant;
  paintReplicas();
}

function selectAppTheme(theme: AppThemeId, remember = true): void {
  currentTheme = theme;
  if (theme !== 'blobi') currentVariant = 'light';
  paintReplicas();
  if (remember) { try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage unavailable: not remembered */ } }
}

document.querySelectorAll<HTMLElement>('[data-theme-switch]').forEach((group) => {
  const options = Array.from(group.querySelectorAll<HTMLButtonElement>('[data-theme-choice]'));
  options.forEach((option, index) => {
    option.addEventListener('click', () => { const t = option.dataset.themeChoice; if (isAppTheme(t)) selectAppTheme(t); });
    option.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const next = options[(index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length];
      const t = next?.dataset.themeChoice;
      if (next && isAppTheme(t)) { selectAppTheme(t); next.focus(); }
    });
  });
});
try { const saved = localStorage.getItem(THEME_KEY); if (isAppTheme(saved) && saved !== currentTheme) selectAppTheme(saved, false); } catch { /* keep the default */ }

const tabList = mainConversation?.querySelector<HTMLElement>('[role="tablist"]');
const headerName = mainConversation?.querySelector<HTMLElement>('[data-active-name]');
const headerPresence = mainConversation?.querySelector<HTMLElement>('[data-active-presence]');
const headerStatus = mainConversation?.querySelector<HTMLElement>('[data-active-status]');
let activeTab = 'mika';
const historyFor = (id: string) => mainConversation?.querySelector<HTMLElement>(`[data-app-history="${CSS.escape(id)}"]`);
const appTabs = () => Array.from(mainConversation?.querySelectorAll<HTMLButtonElement>('[data-app-tab]') ?? []);

function addPersonTab(contact: HTMLButtonElement): string {
  if (!tabList || !mainConversation) return 'mika';
  const id = contact.dataset.contactOpen ?? 'contact';
  if (mainConversation.querySelector(`[data-app-tab="${CSS.escape(id)}"]`)) return id;
  const name = contact.querySelector('.contact-row-copy b')?.textContent?.trim() ?? id;
  const face = contact.querySelector<HTMLElement>('.blob-avatar');
  const presence = contact.dataset.personPresence ?? (face?.dataset.presence === 'offline' ? 'invisible' : face?.dataset.presence ?? 'online');
  const seed = face?.style.getPropertyValue('--avatar-color').match(/avatar-(\d+)/)?.[1] ?? '0';
  const status = contact.dataset.personStatus ?? '';
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'app-conversation-tab'; button.setAttribute('role','tab');
  button.id = `hero-app-tab-${id}`; button.setAttribute('aria-controls',`hero-app-panel-${id}`); button.setAttribute('aria-selected','false'); button.tabIndex = -1;
  button.dataset.appTab = id; button.dataset.tabName = name; button.dataset.kind = 'person'; button.dataset.seed = seed; button.dataset.presence = presence; button.dataset.status = status;
  const avatar = face?.cloneNode(true) as HTMLElement | undefined;
  if (avatar) { avatar.style.setProperty('--avatar-size','24px'); avatar.setAttribute('aria-label',name); button.append(avatar); }
  const label = document.createElement('span'); label.className = 'tab-title'; label.textContent = name; button.append(label);
  const close = document.createElement('span'); close.className = 'tab-close'; close.setAttribute('aria-hidden','true'); close.textContent = '×'; button.append(close);
  tabList.insertBefore(button, tabList.querySelector('.tab-spacer'));
  const panel = document.createElement('div'); panel.className='conversation-history'; panel.id=`hero-app-panel-${id}`; panel.setAttribute('role','tabpanel'); panel.setAttribute('aria-labelledby',button.id); panel.hidden=true; panel.dataset.appHistory=id;
  const log = document.createElement('div'); log.className='message-sequence'; log.setAttribute('role','log'); log.setAttribute('aria-live','polite'); log.setAttribute('aria-relevant','additions text'); log.setAttribute('aria-label',`${demo.window.conversation}: ${name}`); log.dataset.messageSequence=id;
  const empty = document.createElement('p'); empty.className='message-text empty-conversation'; empty.textContent=demo.window.emptyConversation; log.append(empty); panel.append(log);
  mainConversation.querySelector('.conversation-client-body')?.insertBefore(panel,mainConversation.querySelector('.conversation-composer'));
  button.addEventListener('click', () => selectTab(id));
  button.addEventListener('keydown', tabKeydown);
  return id;
}

function openContact(contact: HTMLButtonElement): void {
  hasPlayed = true;
  runToken += 1;
  const id = addPersonTab(contact);
  selectTab(id);
  document.querySelector('#conversation')?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'center'});
}

function selectTab(id: string, focus = false): void {
  const tab = appTabs().find((item) => item.dataset.appTab === id);
  if (!tab || !mainConversation) return;
  activeTab = id;
  appTabs().forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected',String(selected)); item.tabIndex=selected?0:-1;
    if (selected) { item.removeAttribute('data-unread'); item.querySelector<HTMLElement>('[data-unread-badge]')?.setAttribute('hidden',''); }
  });
  mainConversation.querySelectorAll<HTMLElement>('[data-app-history]').forEach((panel) => { panel.hidden = panel.dataset.appHistory !== id; });
  const presence = tab.dataset.presence ?? 'online';
  if (headerName) headerName.textContent=tab.dataset.tabName ?? '';
  if (headerPresence) headerPresence.textContent=demo.presence[presence as keyof typeof demo.presence] ?? '';
  if (headerStatus) headerStatus.textContent=tab.dataset.status ? ` • ${tab.dataset.status}` : '';
  mainConversation.querySelectorAll<HTMLElement>('[data-active-to]').forEach((node) => { node.textContent = tab.dataset.tabName ?? ''; });
  const picture = mainConversation.querySelector<HTMLElement>('[data-active-picture]');
  const face = tab.querySelector<HTMLElement>('.blob-avatar');
  if (picture && face) { const big = face.cloneNode(true) as HTMLElement; big.style.setProperty('--avatar-size','96px'); big.querySelector('svg')?.setAttribute('width','96'); big.querySelector('svg')?.setAttribute('height','96'); picture.replaceChildren(big); }
  // Query each time: the header avatar node is replaced on every tab change.
  const currentHeaderAvatar = mainConversation.querySelector<HTMLElement>('.conversation-header-card .blob-avatar');
  const clone = tab.querySelector<HTMLElement>('.blob-avatar');
  if (currentHeaderAvatar && clone) {
    const copy = clone.cloneNode(true) as HTMLElement;
    copy.style.setProperty('--avatar-size','52px'); copy.querySelector('svg')?.setAttribute('width','52'); copy.querySelector('svg')?.setAttribute('height','52');
    currentHeaderAvatar.replaceWith(copy);
  }
  if (focus) tab.focus();
}

function tabKeydown(event: KeyboardEvent): void {
  const tabs=appTabs(); const index=tabs.indexOf(event.currentTarget as HTMLButtonElement);
  if (index<0) return;
  let next=index;
  if (event.key==='ArrowRight'||event.key==='ArrowDown') next=(index+1)%tabs.length;
  else if(event.key==='ArrowLeft'||event.key==='ArrowUp') next=(index-1+tabs.length)%tabs.length;
  else if(event.key==='Home') next=0; else if(event.key==='End') next=tabs.length-1; else return;
  event.preventDefault(); tabs[next]?.focus(); if(tabs[next]?.dataset.appTab) selectTab(tabs[next]!.dataset.appTab!,true);
}
appTabs().forEach((tab) => { tab.addEventListener('click',()=>selectTab(tab.dataset.appTab ?? 'mika')); tab.addEventListener('keydown',tabKeydown); });
for (const contacts of document.querySelectorAll<HTMLElement>('[data-app-contacts]')) {
  contacts.querySelectorAll<HTMLButtonElement>('[data-contact-open]').forEach((button) => button.addEventListener('click',()=>openContact(button)));
}

const initialRows = new Map<string, HTMLElement[]>();
if (mainConversation) {
  mainConversation.querySelectorAll<HTMLElement>('[data-message-sequence]').forEach((sequence) => {
    initialRows.set(sequence.dataset.messageSequence ?? '',Array.from(sequence.children).map((row)=>row.cloneNode(true) as HTMLElement));
  });
}
let runToken=0;
let hasPlayed=false;
function clearUnread(): void {
  appTabs().forEach((tab)=>{tab.removeAttribute('data-unread');tab.querySelector<HTMLElement>('[data-unread-badge]')?.setAttribute('hidden','');});
}
function appendSystemLine(message: string): void {
  const panel=historyFor(activeTab); if(!panel)return;
  const row=document.createElement('p'); row.className='system-line'; row.textContent=message;
  panel.querySelector('[data-message-sequence]')?.append(row);
}
function setUnread(id:string):void{
  const tab=appTabs().find((item)=>item.dataset.appTab===id); if(!tab||id===activeTab)return;
  tab.dataset.unread='true'; const badge=tab.querySelector<HTMLElement>('[data-unread-badge]');
  if(badge){badge.hidden=false;badge.setAttribute('aria-label',demo.window.unreadOne);}
}
async function playConversation():Promise<void>{
  if(!mainConversation)return;
  hasPlayed=true; const token=++runToken; clearUnread(); selectTab('mika');
  for(const [id] of initialRows){const sequence=mainConversation.querySelector<HTMLElement>(`[data-message-sequence="${CSS.escape(id)}"]`);sequence?.replaceChildren();}
  const rows=initialRows.get('mika')??[]; const sequence=mainConversation.querySelector<HTMLElement>('[data-message-sequence="mika"]');
  for(const [index,row] of rows.entries()){
    if(token!==runToken)return;
    sequence?.append(row.cloneNode(true));
    const panel=historyFor('mika'); if(panel)panel.scrollTop=panel.scrollHeight;
    if(index===2){const groupRows=initialRows.get('weekend')??[];if(groupRows[0])historyFor('weekend')?.querySelector('[data-message-sequence]')?.append(groupRows[0].cloneNode(true));setUnread('weekend');}
    await new Promise((resolve)=>window.setTimeout(resolve,reducedMotion?0:720));
  }
  if(token!==runToken)return;
}
const replayButtons=document.querySelectorAll<HTMLButtonElement>('[data-replay]');
replayButtons.forEach((button)=>button.addEventListener('click',()=>{if(replaysMainConversation(button,mainConversation))void playConversation();}));
if(mainConversation){
  const observer=new IntersectionObserver((entries)=>{if(entries.some((entry)=>entry.isIntersecting)){observer.disconnect();if(!hasPlayed)void playConversation();}},{threshold:.4});
  observer.observe(mainConversation);
}

let lastNudge=0;
mainConversation?.querySelectorAll<HTMLButtonElement>('[data-nudge]').forEach((button)=>button.addEventListener('click',()=>{
  const now=Date.now();if(now-lastNudge<1500)return;lastNudge=now;
  const surface=mainConversation.querySelector<HTMLElement>('[data-shake-surface]');
  const line=demo.nudgeSystem.replace('{name}',appTabs().find((tab)=>tab.dataset.appTab===activeTab)?.dataset.tabName??'Mika');
  if(reducedMotion||!surface){appendSystemLine(line);return;}
  let frame=0;const start=performance.now();mainConversation.classList.add('is-nudging');
  const tick=(time:number)=>{
    if(frame>=40){surface.style.transform='';mainConversation.classList.remove('is-nudging');appendSystemLine(line);return;}
    if(time-start>=16){frame++;surface.style.transform=`translateX(${Math.sin(frame*1.3)*14*(1-frame/40)}px)`;requestAnimationFrame(tick);}
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}));
