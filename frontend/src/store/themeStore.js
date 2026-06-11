import { create } from 'zustand';

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('crm_dark_mode') !== 'false',
  
  toggleDarkMode: () => {
    set((state) => {
      const isDark = !state.darkMode;
      localStorage.setItem('crm_dark_mode', String(isDark));
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { darkMode: isDark };
    });
  },

  initTheme: () => {
    const isDark = localStorage.getItem('crm_dark_mode') !== 'false';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode: isDark });
  },
}));

export default useThemeStore;
