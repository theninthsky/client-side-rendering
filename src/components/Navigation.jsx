import { useState, useMemo } from 'react'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest.json'
import NavigationLink from './NavigationLink'
import SunIcon from 'images/sun.svg'
import MoonIcon from 'images/moon.svg'

const [THEME_LIGHT, THEME_DARK] = ['light', 'dark']

document.documentElement.setAttribute('data-theme', localStorage.theme || THEME_LIGHT)

const Navigation = () => {
  const [theme, setTheme] = useState(localStorage.theme || THEME_LIGHT)

  const links = useMemo(
    () =>
      pagesManifest.map(({ path, title, heading, data }) => (
        <NavigationLink key={path} to={path} data={data}>
          <span>{heading || title}</span>
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
      {links}

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
  theme: css`
    margin-left: auto;
  `
}

export default Navigation
