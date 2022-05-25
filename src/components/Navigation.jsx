import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useDelayedNavigate } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import routeManifest from 'route-chunk-manifest.json'
import SunIcon from 'images/sun.svg'
import MoonIcon from 'images/moon.svg'

const [THEME_LIGHT, THEME_DARK] = ['light', 'dark']

document.documentElement.setAttribute('data-theme', localStorage.theme || 'light')

const Navigation = () => {
  const [theme, setTheme] = useState(localStorage.theme || THEME_LIGHT)

  const navigate = useDelayedNavigate()

  const links = useMemo(
    () =>
      routeManifest.map(({ path, title }) => (
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
    [routeManifest]
  )

  const toggleTheme = () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === THEME_LIGHT ? THEME_DARK : THEME_LIGHT

    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div className={style.wrapper}>
      {links}

      <button className={style.theme}>
        {theme === THEME_LIGHT ? (
          <SunIcon width="22px" onClick={toggleTheme} />
        ) : (
          <MoonIcon width="22px" onClick={toggleTheme} />
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
