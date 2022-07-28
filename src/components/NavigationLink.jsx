import { useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useDelayedNavigate, useMedia } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import { MOBILE_VIEWPORT } from 'styles/constants'

const createPreload = ({ url, crossorigin, menuPreload }) => {
  if (!menuPreload || document.head.querySelector(`link[href="${url}"]`)) return

  document.head.appendChild(
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

const NavigationLink = ({ className, to, data, onClick, children, ...otherProps }) => {
  const ref = useRef()

  const navigate = useDelayedNavigate()

  const { hoverable } = useMedia({ hoverable: '(hover: hover) and (pointer: fine)' })

  const baseURL = to.replace('/*', '')

  useEffect(() => {
    if (hoverable || !data) return

    const observer = new IntersectionObserver(
      (_, observer) => {
        onLinkEvent(data)
        if (ref.current) observer.unobserve(ref.current)
      },
      { root: document.body }
    )

    observer.observe(ref.current)
  }, [hoverable])

  const onLinkClick = event => {
    event.preventDefault()
    navigate(baseURL)
    onClick?.()
  }

  return (
    <NavLink
      className={({ isActive }) => cx(style.item, { [style.activeItem]: isActive }, className)}
      ref={ref}
      to={baseURL}
      onClick={onLinkClick}
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
      margin: 0;
      padding: 8px 0;
      border: none;
      font-size: 18px;
    }
  `,
  activeItem: css`
    border-left: 5px solid dodgerblue;
    color: dodgerblue;
    cursor: default;

    @media ${MOBILE_VIEWPORT} {
      border: none;
    }
  `
}

export default NavigationLink
