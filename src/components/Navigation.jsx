import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useDelayedNavigate } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import { MOBILE_VIEWPORT } from 'styles/constants'
import pagesManifest from 'pages-manifest.json'
import SunIcon from 'images/sun.svg'
import MoonIcon from 'images/moon.svg'

const [THEME_LIGHT, THEME_DARK] = ['light', 'dark']

document.documentElement.setAttribute('data-theme', localStorage.theme || THEME_LIGHT)

const Navigation = () => {
  const [theme, setTheme] = useState(localStorage.theme || THEME_LIGHT)

  const navigate = useDelayedNavigate()

  const links = useMemo(
    () =>
      pagesManifest.map(({ path, title }) => (
        <NavLink
          key={path}
          className={({ isActive }) => cx(style.item, { [style.activeItem]: isActive })}
          to={path}
          onClick={event => {
            event.preventDefault()
            navigate(path)
          }}
        >
          <span>{title}</span>
        </NavLink>
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
  item: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 20px;
    padding-left: 5px;
    border-left: 5px solid transparent;
    color: #b8b8b8;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    text-decoration: none;

    @media ${MOBILE_VIEWPORT} {
      margin-right: 15px;
    }
  `,
  activeItem: css`
    border-left: 5px solid dodgerblue;
    color: dodgerblue;
    cursor: default;
  `,
  theme: css`
    margin-left: auto;
  `
}

export default Navigation
