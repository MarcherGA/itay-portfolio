import { create } from "zustand";

type ThemeMode = 'bright' | 'dark';

type ThemeStore = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'bright',
  
  toggleMode: () => set((state) => ({ 
    mode: state.mode === 'bright' ? 'dark' : 'bright' 
  })),
  
  setMode: (mode) => set({ mode }),
}));
