export type ThemeMap = {
  bg50: string; bg400: string; bg500: string; bg600: string;
  hoverBg700: string; hoverBg600: string;
  text400: string; text500: string; text600: string; text700: string;
  hoverText600: string; border100: string; shadow20: string; shadow30: string;
  selection: string;
};

export const THEMES: Record<string, ThemeMap> = {
  emerald: {
    bg50: 'bg-success-50', bg400: 'bg-primary', bg500: 'bg-primary', bg600: 'bg-primary',
    hoverBg700: 'hover:bg-success-700', hoverBg600: 'hover:bg-primary',
    text400: 'text-primary', text500: 'text-primary', text600: 'text-success-600', text700: 'text-success-700',
    hoverText600: 'hover:text-success-600', border100: 'border-success-100',
    shadow20: 'shadow-success-600/20', shadow30: 'shadow-success-600/30',
    selection: 'selection:bg-success-200 selection:text-success-900'
  },
  blue: {
    bg50: 'bg-primary-50', bg400: 'bg-primary-400', bg500: 'bg-primary-500', bg600: 'bg-primary-600',
    hoverBg700: 'hover:bg-primary-700', hoverBg600: 'hover:bg-primary-600',
    text400: 'text-primary-400', text500: 'text-primary-500', text600: 'text-primary-600', text700: 'text-primary-700',
    hoverText600: 'hover:text-primary-600', border100: 'border-primary-100',
    shadow20: 'shadow-primary-600/20', shadow30: 'shadow-primary-600/30',
    selection: 'selection:bg-primary-200 selection:text-primary-900'
  },
  indigo: {
    bg50: 'bg-primary-50', bg400: 'bg-primary-400', bg500: 'bg-primary', bg600: 'bg-primary',
    hoverBg700: 'hover:bg-primary-700', hoverBg600: 'hover:bg-primary',
    text400: 'text-primary', text500: 'text-primary', text600: 'text-primary-600', text700: 'text-primary-700',
    hoverText600: 'hover:text-primary-600', border100: 'border-primary-100',
    shadow20: 'shadow-primary-600/20', shadow30: 'shadow-primary-600/30',
    selection: 'selection:bg-primary-200 selection:text-primary-900'
  },
  violet: {
    bg50: 'bg-primary-50', bg400: 'bg-primary-400', bg500: 'bg-primary-500', bg600: 'bg-primary-600',
    hoverBg700: 'hover:bg-primary-700', hoverBg600: 'hover:bg-primary-600',
    text400: 'text-primary-400', text500: 'text-primary-500', text600: 'text-primary-600', text700: 'text-primary-700',
    hoverText600: 'hover:text-primary-600', border100: 'border-primary-100',
    shadow20: 'shadow-primary-600/20', shadow30: 'shadow-primary-600/30',
    selection: 'selection:bg-primary-200 selection:text-primary-900'
  },
  rose: {
    bg50: 'bg-error-50', bg400: 'bg-error-400', bg500: 'bg-error-500', bg600: 'bg-error-600',
    hoverBg700: 'hover:bg-error-700', hoverBg600: 'hover:bg-error-600',
    text400: 'text-error-400', text500: 'text-error-500', text600: 'text-error-600', text700: 'text-error-700',
    hoverText600: 'hover:text-error-600', border100: 'border-error-100',
    shadow20: 'shadow-error-600/20', shadow30: 'shadow-error-600/30',
    selection: 'selection:bg-error-200 selection:text-error-900'
  },
  amber: {
    bg50: 'bg-warning-50', bg400: 'bg-warning-400', bg500: 'bg-warning-500', bg600: 'bg-warning-600',
    hoverBg700: 'hover:bg-warning-700', hoverBg600: 'hover:bg-warning-600',
    text400: 'text-warning-400', text500: 'text-warning-500', text600: 'text-warning-600', text700: 'text-warning-700',
    hoverText600: 'hover:text-warning-600', border100: 'border-warning-100',
    shadow20: 'shadow-warning-600/20', shadow30: 'shadow-warning-600/30',
    selection: 'selection:bg-warning-200 selection:text-warning-900'
  },
  slate: {
    bg50: 'bg-slate-200', bg400: 'bg-slate-500', bg500: 'bg-muted-foreground', bg600: 'bg-muted',
    hoverBg700: 'hover:bg-card', hoverBg600: 'hover:bg-muted-foreground',
    text400: 'text-muted-foreground', text500: 'text-muted-foreground', text600: 'text-slate-800', text700: 'text-slate-900',
    hoverText600: 'hover:text-slate-700', border100: 'border-slate-300',
    shadow20: 'shadow-slate-800/20', shadow30: 'shadow-slate-800/30',
    selection: 'selection:bg-slate-300 selection:text-slate-900'
  },
};

export interface SectionStyle {
  bg: string;
  text: string;
  textMuted: string;
  isDark: boolean;
}

export function getSectionStyle(theme: string | undefined, defaultBg: string, cTheme: ThemeMap): SectionStyle {
  const t = theme || 'default';
  switch (t) {
    case 'white': return { bg: 'bg-white', text: 'text-slate-900', textMuted: 'text-slate-600', isDark: false };
    case 'gray': return { bg: 'bg-slate-50', text: 'text-slate-900', textMuted: 'text-slate-600', isDark: false };
    case 'brand': return { bg: cTheme.bg600, text: 'text-white', textMuted: 'text-slate-200', isDark: true };
    case 'slate': return { bg: 'bg-card', text: 'text-white', textMuted: 'text-muted-foreground', isDark: true };
    case 'pitch': return { bg: 'bg-black', text: 'text-white', textMuted: 'text-muted-foreground', isDark: true };
    default:
      const isActuallyDark = defaultBg.includes('slate-900') || defaultBg.includes('black');
      return {
        bg: defaultBg,
        text: isActuallyDark ? 'text-white' : 'text-slate-900',
        textMuted: isActuallyDark ? 'text-muted-foreground' : 'text-slate-600',
        isDark: isActuallyDark
      };
  }
}
