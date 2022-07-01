import { useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useDelayedNavigate, useMedia } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import { MOBILE_VIEWPORT } from 'styles/constants'

const createPreload = ({ url, crossorigin, preload }) => {
  if (!preload || document.body.querySelector(`body > link[href="${url}"]`)) return

  document.body.appendChild(
    Object.assign(document.createElement('link'), {
      rel: 'preload',
      href: url,
      as: 'fetch',
      crossOrigin: crossorigin
    })
  )
}

const onLinkEvent = data => {
  if (Array.isArray(data)) return data.forEach(createPreload)

  createPreload(data)
}

const NavigationLink = ({ className, to, data, children, ...otherProps }) => {
  const ref = useRef()

  const navigate = useDelayedNavigate()

  const { hoverable } = useMedia({ hoverable: '(hover: hover) and (pointer: fine)' })

  useEffect(() => {
    if (hoverable || !data) return

    const observer = new IntersectionObserver(
      (_, observer) => {
        onLinkEvent(data)
        observer.unobserve(ref.current)
      },
      { root: document.body }
    )

    observer.observe(ref.current)
  }, [hoverable])

  return (
    <NavLink
      className={({ isActive }) => cx(style.item, { [style.activeItem]: isActive }, className)}
      ref={ref}
      to={to}
      onClick={event => {
        event.preventDefault()
        navigate(to)
      }}
      {...(hoverable &&
        data && {
          onMouseEnter: () => onLinkEvent(data),
          onFocus: () => onLinkEvent(data)
        })}
      {...otherProps}
    >
      {children}
    </NavLink>
  )
}

const style = {
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
  `
}

export default NavigationLink
