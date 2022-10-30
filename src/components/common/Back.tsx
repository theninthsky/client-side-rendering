import type { FC } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { css, cx } from '@emotion/css'

import BackIcon from 'images/back.svg'

const Back: FC<LinkProps> = ({ className, ...otherProps }) => {
  return (
    <Link className="flex" {...otherProps}>
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
