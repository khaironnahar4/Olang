import { create } from 'zustand'

interface ThemeState {
    theme: string
    setTheme: (theme: string) => void
} 

export const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem("OLang-theme") || "forest",
  setTheme: (theme) => {
    localStorage.setItem("OLang-theme", theme);
    set({theme});

}
}))