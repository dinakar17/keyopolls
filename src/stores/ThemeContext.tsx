'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme as useNextTheme } from 'next-themes';

import { DEFAULT_THEME, ThemeName, getThemeConfig, isValidTheme } from '@/lib/themes';

// Simple wrapper to match your existing API
export function useTheme() {
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme();

  // Get the actual resolved theme, fallback to default if invalid
  const currentTheme =
    resolvedTheme && isValidTheme(resolvedTheme) ? (resolvedTheme as ThemeName) : DEFAULT_THEME;

  const themeConfig = getThemeConfig(currentTheme);

  return {
    theme: currentTheme,
    setTheme: (newTheme: ThemeName) => setNextTheme(newTheme),
    toggleTheme: () => {
      // Toggle between light and the first dark theme (midnight)
      const isDark = themeConfig.isDark;
      setNextTheme(isDark ? 'light' : 'midnight');
    },
    isDark: themeConfig.isDark,
    themeConfig, // Bonus: expose full theme config
  };
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = 'app-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  storageKey?: string;
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      enableSystem={false} // Disable system since you have custom themes
      themes={['light', 'midnight', 'ocean', 'sunset', 'forest', 'discord', 'slack']}
      storageKey={storageKey}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
