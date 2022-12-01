import type { FC } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { useDelayedNavigate } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import BackIcon from 'images/back.svg'

const Back: FC<LinkProps> = ({ className, to, onClick, ...otherProps }) => {
  const navigate = useDelayedNavigate()

  return (
    <Link
      className="flex"
      to={to}
      onClick={event => {
        event.preventDefault()
        navigate(to)
        onClick?.(event)
      }}
      {...otherProps}
    >
      <BackIcon className={cx(style.backIcon, className)} />
    </Link>
  )
}

const style = {
  backIcon: css`
    width: 18px;
    color: var(--primary-color);
  `
}

export default Back
