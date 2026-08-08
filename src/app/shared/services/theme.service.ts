import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'aydi_portfolio_theme';
  currentTheme = signal<Theme>('dark');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem(this.THEME_KEY) as Theme | null;
    const initialTheme: Theme = saved ? saved : 'dark';
    this.setTheme(initialTheme);
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);

    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
