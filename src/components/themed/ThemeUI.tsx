'use client';

import React from 'react';

import { ThemeName, getAllThemes } from '@/lib/themes';
import { useTheme } from '@/stores/ThemeContext';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const themes = getAllThemes();

  return (
    <div className="relative">
      <label htmlFor="theme-select" className="text-text-secondary mb-2 block text-sm font-medium">
        Choose Theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
        className="bg-surface border-border text-text focus:ring-primary w-full rounded-lg border px-3 py-2 transition-colors focus:border-transparent focus:ring-2 focus:outline-none"
      >
        {themes.map((themeConfig) => (
          <option key={themeConfig.name} value={themeConfig.name}>
            {themeConfig.icon} {themeConfig.displayName} - {themeConfig.description}
          </option>
        ))}
      </select>
    </div>
  );
}

// components/themed/ThemeGrid.tsx
export function ThemeGrid() {
  const { theme, setTheme } = useTheme();
  const themes = getAllThemes();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {themes.map((themeConfig) => (
        <button
          key={themeConfig.name}
          onClick={() => setTheme(themeConfig.name)}
          className={`group relative rounded-xl border-2 p-4 transition-all duration-200 ${
            theme === themeConfig.name
              ? 'border-primary bg-surface-elevated scale-105 shadow-lg'
              : 'border-border hover:border-primary bg-surface hover:bg-surface-elevated'
          } `}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-2xl">{themeConfig.icon}</span>
            <span className="text-text font-medium">{themeConfig.displayName}</span>
            <span className="text-text-muted text-center text-xs">{themeConfig.description}</span>
            {themeConfig.hasGradients && (
              <div className="bg-gradient-primary h-2 w-full rounded-full"></div>
            )}
          </div>
          {theme === themeConfig.name && (
            <div className="bg-primary absolute -top-1 -right-1 h-3 w-3 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
}

// components/themed/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseClasses = 'rounded-xl border transition-colors duration-200';
  const variantClasses = {
    default: 'bg-surface border-border',
    elevated: 'bg-surface-elevated border-border shadow-lg',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</div>;
}

// components/themed/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary hover:opacity-90 text-white focus:ring-primary',
    secondary: 'bg-secondary hover:opacity-90 text-white focus:ring-secondary',
    accent: 'bg-accent hover:opacity-90 text-white focus:ring-accent',
    ghost:
      'bg-transparent hover:bg-surface-elevated text-text border border-border focus:ring-primary',
    gradient: 'bg-gradient-primary hover:scale-105 text-white focus:ring-primary',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// components/themed/Input.tsx
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
  label?: string;
}

export function Input({
  placeholder,
  value,
  onChange,
  type = 'text',
  className = '',
  label,
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-text-secondary mb-2 block text-sm font-medium">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-surface border-border text-text placeholder-text-muted focus:ring-primary w-full rounded-lg border px-3 py-2 transition-colors focus:border-transparent focus:ring-2 focus:outline-none"
      />
    </div>
  );
}

// components/themed/ThemeToggle.tsx
export function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="bg-surface hover:bg-surface-elevated border-border rounded-lg border p-2 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

// components/themed/GradientCard.tsx
interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'accent' | 'surface';
}

export function GradientCard({ children, className = '', variant = 'surface' }: GradientCardProps) {
  const variantClasses = {
    primary: 'bg-gradient-primary text-white',
    accent: 'bg-gradient-accent text-white',
    surface: 'bg-gradient-surface border border-border',
  };

  return (
    <div
      className={`rounded-xl p-6 transition-all duration-200 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

// components/themed/SpecialEffectCard.tsx
interface SpecialEffectCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpecialEffectCard({ children, className = '' }: SpecialEffectCardProps) {
  return <div className={`card-special ${className}`}>{children}</div>;
}
