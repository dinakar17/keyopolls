// lib/themes.ts
export type ThemeName = 'light' | 'midnight' | 'ocean' | 'sunset' | 'forest' | 'discord' | 'slack';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  description: string;
  isDark: boolean;
  icon: string;
  hasGradients: boolean;
  specialEffects: string[];
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Light',
    description: 'Clean and bright theme',
    isDark: false,
    icon: '☀️',
    hasGradients: true,
    specialEffects: [],
  },
  midnight: {
    name: 'midnight',
    displayName: 'Midnight',
    description: 'Dark purple theme with glowing effects',
    isDark: true,
    icon: '🌙',
    hasGradients: true,
    specialEffects: ['glow-effect'],
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    description: 'Cool blue depths with wave animations',
    isDark: true,
    icon: '🌊',
    hasGradients: true,
    specialEffects: ['wave-effect'],
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    description: 'Warm orange and pink with ember effects',
    isDark: true,
    icon: '🌅',
    hasGradients: true,
    specialEffects: ['ember-effect'],
  },
  discord: {
    name: 'discord',
    displayName: 'Discord',
    description: 'Gaming-inspired dark theme with blurple accents',
    isDark: true,
    icon: '🎮',
    hasGradients: true,
    specialEffects: ['discord-glow', 'discord-pulse'],
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    description: 'Natural green tones with leaf shadows',
    isDark: true,
    icon: '🌲',
    hasGradients: true,
    specialEffects: ['leaf-shadow'],
  },
  slack: {
    name: 'slack',
    displayName: 'Slack',
    description: 'Clean professional workspace theme with purple accents',
    isDark: false,
    icon: '💼',
    hasGradients: true,
    specialEffects: ['slack-highlight', 'slack-border'],
  },
};

export const DEFAULT_THEME: ThemeName = 'light';

// Theme utility functions
export const getThemeConfig = (theme: ThemeName): ThemeConfig => THEMES[theme];
export const getAllThemes = (): ThemeConfig[] => Object.values(THEMES);
export const isValidTheme = (theme: string): theme is ThemeName => theme in THEMES;
export const getThemesWithGradients = (): ThemeConfig[] =>
  getAllThemes().filter((theme) => theme.hasGradients);
export const getThemeSpecialEffects = (theme: ThemeName): string[] => THEMES[theme].specialEffects;
