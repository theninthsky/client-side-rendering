import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useDelayedNavigate } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

const linkManifest = [
  { to: '/', title: 'Home' },
  { to: 'info', title: 'Info' },
  { to: 'quotes', title: 'Quotes' },
  { to: 'pokemon', title: 'Pokémon' }
]

const Navigation = () => {
  const navigate = useDelayedNavigate()

  const links = useMemo(
    () =>
      linkManifest.map(({ to, title }) => (
        <NavLink
          key={to}
          className={({ isActive }) => cx(style.item, { [style.activeItem]: isActive })}
          to={to}
          onClick={event => {
            event.preventDefault()
            navigate(to)
          }}
        >
          <span>{title}</span>
        </NavLink>
      )),
    [linkManifest]
  )

  return <div className={style.wrapper}>{links}</div>
}

const style = {
  wrapper: css`
    display: flex;
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
  `
}

export default Navigation
