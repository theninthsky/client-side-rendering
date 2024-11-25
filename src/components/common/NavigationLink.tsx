import { useRef, FC } from 'react'
import { NavLink, NavLinkProps } from 'react-router-dom'
import { useTransitionNavigate, useMedia } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import { MOBILE_VIEWPORT } from 'styles/constants'

export type Data = Partial<Request> & {
  url: string
}

export type NavigationLinkProps = NavLinkProps & {
  to: string
  data?: Data[]
}

const NavigationLink: FC<NavigationLinkProps> = ({
  className,
  to,
  replace,
  state,
  preventScrollReset,
  relative,
  data,
  onClick,
  children,
  ...otherProps
}) => {
  const ref = useRef<HTMLAnchorElement>(null)

  const navigate = useTransitionNavigate()

  const { hoverable } = useMedia({ hoverable: '(hover: hover) and (pointer: fine)' })

  const baseURL = to.replace('/*', '')

  const onLinkClick = event => {
    event.preventDefault()
    navigate(baseURL, { replace, state, preventScrollReset, relative })
    onClick?.(event)
  }

  return (
    <NavLink
      className={({ isActive }) => cx(style.item, { [style.activeItem]: isActive }, className as string)}
      ref={ref}
      to={baseURL}
      end
      onClick={onLinkClick}
      onMouseEnter={() => {
        // @ts-ignore
        hoverable ? data?.forEach(({ url, ...request }) => fetch(url, { ...request, preload: true })) : undefined
      }}
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
      font-size: 20px;
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
