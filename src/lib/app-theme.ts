import blobi from '../content/themes/blobi.json';
import liveNostalgiaModern from '../content/themes/live-nostalgia-modern.json';

type ThemeColors = Record<string, string>;

export type AppThemeVariant = 'light' | 'dark';
export type AppThemeId = 'blobi' | 'live-nostalgia-modern';
export const APP_THEMES: readonly AppThemeId[] = ['live-nostalgia-modern', 'blobi'];
export const DEFAULT_APP_THEME: AppThemeId = 'live-nostalgia-modern';
export const isAppTheme = (value: unknown): value is AppThemeId => value === 'blobi' || value === 'live-nostalgia-modern';

const vars = (colors: ThemeColors) => Object.entries(colors).map(([key, value]) => `--app-${key}:${value}`).join(';');

// Inline custom properties for one built-in theme, mirrored from apps/blobi-desktop/themes/.
export function appThemeStyle(variant: AppThemeVariant, theme: AppThemeId = DEFAULT_APP_THEME): string {
  if (theme === 'live-nostalgia-modern') {
    const t = liveNostalgiaModern;
    const base = '/theme/live-nostalgia-modern/';
    return `${vars(t.colors as ThemeColors)};--app-sky:url('${base}sky.svg');--app-hero-art:url('${base}${t.assets.hero}');--app-header-art:url('${base}${t.assets.header}');--app-wave-opacity:${t.fx['wave-opacity']};--app-font:'Segoe UI','Selawik',Tahoma,'Noto Sans',sans-serif`;
  }
  const colors = (variant === 'dark' ? blobi.variants.dark.colors : blobi.colors) as ThemeColors;
  const art = variant === 'dark' ? blobi.variants.dark.assets : blobi.assets;
  const sky = variant === 'dark' ? 'sky-dark.svg' : 'sky.svg';
  const fx = variant === 'dark' ? blobi.variants.dark.fx : blobi.fx;
  return `${vars(colors)};--app-sky:url('/theme/blobi/${sky}');--app-hero-art:url('/theme/blobi/${art.hero}');--app-header-art:url('/theme/blobi/${art.header}');--app-wave-opacity:${fx['wave-opacity']}`;
}
