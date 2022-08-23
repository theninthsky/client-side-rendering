import create from 'zustand'

export const [THEME_LIGHT, THEME_DARK] = ['light', 'dark']

document.documentElement.setAttribute('data-theme', localStorage.theme || THEME_LIGHT)

export type Store = {
  theme: string
  setTheme: (newTheme: string) => void
}

export default create<Store>(set => ({
  theme: localStorage.theme || THEME_LIGHT,
  setTheme: newTheme => {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    set({ theme: newTheme })
  }
}))
