import create from 'zustand'

export const [THEME_LIGHT, THEME_DARK] = ['light', 'dark']

document.documentElement.setAttribute('data-theme', localStorage.theme || THEME_LIGHT)

export default create(set => ({
  theme: localStorage.theme || THEME_LIGHT,
  setTheme: (newTheme: string) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    set({ theme: newTheme })
  }
}))
