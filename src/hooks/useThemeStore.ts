import { create } from "zustand";

type ThemeMode = 'bright' | 'dark';

type ThemeStore = {
  mode: ThemeMode;
  isSystemTheme: boolean;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setSystemTheme: (useSystem: boolean) => void;
};

// Cookie helpers
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Get system theme preference
const getSystemTheme = (): ThemeMode => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'bright';
};

// Get initial theme (cookie override or system preference)
const getInitialTheme = (): { mode: ThemeMode; isSystemTheme: boolean } => {
  const savedTheme = getCookie('theme-override');
  if (savedTheme === 'dark' || savedTheme === 'bright') {
    return { mode: savedTheme, isSystemTheme: false };
  }
  return { mode: getSystemTheme(), isSystemTheme: true };
};

const { mode: initialMode, isSystemTheme: initialIsSystemTheme } = getInitialTheme();

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: initialMode,
  isSystemTheme: initialIsSystemTheme,
  
  toggleMode: () => {
    const currentMode = get().mode;
    const newMode = currentMode === 'bright' ? 'dark' : 'bright';
    set({ mode: newMode, isSystemTheme: false });
    setCookie('theme-override', newMode, 30);
  },
  
  setMode: (mode: ThemeMode) => {
    set({ mode, isSystemTheme: false });
    setCookie('theme-override', mode, 30);
  },

  setSystemTheme: (useSystem: boolean) => {
    if (useSystem) {
      const systemTheme = getSystemTheme();
      set({ mode: systemTheme, isSystemTheme: true });
      deleteCookie('theme-override');
    }
  },
}));

// Listen to system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  const { isSystemTheme } = useThemeStore.getState();
  if (isSystemTheme) {
    const newMode = e.matches ? 'dark' : 'bright';
    // Update theme without setting override cookie
    useThemeStore.setState({ mode: newMode });
  }
};

mediaQuery.addEventListener('change', handleSystemThemeChange);
