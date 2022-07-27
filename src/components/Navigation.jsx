import { useState, useMemo } from 'react'
import { Media } from 'frontend-essentials'
import { css } from '@emotion/css'
import { Drawer } from '@mui/material'

import { MOBILE_VIEWPORT, DESKTOP_VIEWPORT } from 'styles/constants'
import pagesManifest from 'pages-manifest.json'
import NavigationLink from './NavigationLink'
import MenuIcon from 'images/menu.svg'
import SunIcon from 'images/sun.svg'
import MoonIcon from 'images/moon.svg'

const [THEME_LIGHT, THEME_DARK] = ['light', 'dark']

document.documentElement.setAttribute('data-theme', localStorage.theme || THEME_LIGHT)

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.theme || THEME_LIGHT)

  const links = useMemo(
    () =>
      pagesManifest
        .filter(({ menuItem = true }) => menuItem)
        .map(({ path, title, heading, data }) => (
          <NavigationLink key={path} to={path} data={data} onClick={() => setDrawerOpen(false)}>
            {heading || title}
          </NavigationLink>
        )),
    [pagesManifest]
  )

  const toggleTheme = newTheme => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div className={style.wrapper}>
      <Media query={DESKTOP_VIEWPORT}>{links}</Media>

      <Media query={MOBILE_VIEWPORT}>
        <MenuIcon className={style.menuIcon} onClick={() => setDrawerOpen(true)} />

        <Drawer className={style.drawer} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {links}
        </Drawer>
      </Media>

      <button className={style.theme}>
        {theme === THEME_LIGHT ? (
          <SunIcon width="22px" onClick={() => toggleTheme(THEME_DARK)} />
        ) : (
          <MoonIcon width="22px" onClick={() => toggleTheme(THEME_LIGHT)} />
        )}
      </button>
    </div>
  )
}

const style = {
  wrapper: css`
    display: flex;
    align-items: center;
    padding: 15px;
    box-shadow: 3px 0px 6px 0px #00000029;
  `,
  menuIcon: css`
    width: 26px;
    color: var(--text-color);
  `,
  drawer: css`
    .MuiDrawer-paper {
      align-items: flex-start;
      padding: 10px 22px;
      background-color: var(--bg-color);
    }
  `,
  theme: css`
    margin-left: auto;
    color: var(--text-color);
  `
}

export default Navigation
