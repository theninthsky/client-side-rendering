import { useState, useMemo, useRef, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { Media } from 'frontend-essentials'
import { css, cx } from '@emotion/css'
import { Drawer } from '@mui/material'

import pages from 'pages'
import { MOBILE_VIEWPORT, DESKTOP_VIEWPORT } from 'styles/constants'
import { getDataPreloadHandlers } from 'utils/data-preload'
import useStore, { THEME_LIGHT, THEME_DARK } from 'hooks/useStore'
import NavigationLink from 'components/common/NavigationLink'
import MenuIcon from 'images/menu.svg'
import SunIcon from 'images/sun.svg'
import MoonIcon from 'images/moon.svg'

const NAVIGATION_HEIGHT = 55

const Navigation = () => {
  const { theme, setTheme } = useStore(useShallow(({ theme, setTheme }) => ({ theme, setTheme })))

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [stickyPosition, setStickyPosition] = useState(-NAVIGATION_HEIGHT)

  const prevScrollY = useRef(window.scrollY)

  useEffect(() => {
    window.addEventListener('scroll', () => {
      const { scrollY } = window
      const scrollingUp = scrollY < prevScrollY.current

      prevScrollY.current = scrollY

      setStickyPosition(prevStickyPosition => {
        if (scrollingUp) return prevStickyPosition <= -3 ? prevStickyPosition + 3 : 0

        return prevStickyPosition >= -(NAVIGATION_HEIGHT - 3) ? prevStickyPosition - 3 : -NAVIGATION_HEIGHT
      })
    })
  }, [])

  const links = useMemo(
    () =>
      Object.values(pages)
        .filter(({ menuItem = true }) => menuItem)
        .map(({ path, title }) => {
          const { onClick: preloadDynamicData, ...staticDataPreloadHandlers } = getDataPreloadHandlers(path) || {}

          return (
            <NavigationLink
              key={path}
              to={path}
              onClick={() => {
                preloadDynamicData?.()
                setDrawerOpen(false)
              }}
              {...staticDataPreloadHandlers}
            >
              {title}
            </NavigationLink>
          )
        }),
    [pages]
  )

  const positionStyle = css`
    top: ${stickyPosition}px;
  `

  return (
    <div className={cx(style.wrapper, positionStyle)}>
      <Media query={DESKTOP_VIEWPORT}>{links}</Media>

      <Media query={MOBILE_VIEWPORT}>
        <MenuIcon className={style.menuIcon} onClick={() => setDrawerOpen(true)} />

        <Drawer className={style.drawer} open={drawerOpen} keepMounted onClose={() => setDrawerOpen(false)}>
          {links}
        </Drawer>
      </Media>

      <button className={style.theme}>
        {theme === THEME_LIGHT ? (
          <SunIcon width="22px" onClick={() => setTheme(THEME_DARK)} />
        ) : (
          <MoonIcon width="22px" onClick={() => setTheme(THEME_LIGHT)} />
        )}
      </button>
    </div>
  )
}

const style = {
  wrapper: css`
    z-index: 1;
    display: flex;
    align-items: center;
    position: sticky;
    padding: 15px;
    box-shadow: 3px 0px 6px 0px #00000029;
    background-color: var(--bg-color);
    transition: background-color 0.2s;
  `,
  menuIcon: css`
    width: 25px;
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
