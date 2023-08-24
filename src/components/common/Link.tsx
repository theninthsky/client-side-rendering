import { FC } from 'react'
import { Link as ReactRouterLink, LinkProps } from 'react-router-dom'

import useViewTransitionNavigate from 'hooks/useViewTransitionNavigate'

const Link: FC<LinkProps> = ({ to, replace, state, preventScrollReset, relative, onClick, children, ...otheProps }) => {
  const navigate = useViewTransitionNavigate()

  const onLinkClick = event => {
    event.preventDefault()
    navigate(to, { replace, state, preventScrollReset, relative })
    onClick?.(event)
  }

  return (
    <ReactRouterLink to={to} onClick={onLinkClick} {...otheProps}>
      {children}
    </ReactRouterLink>
  )
}

export default Link
