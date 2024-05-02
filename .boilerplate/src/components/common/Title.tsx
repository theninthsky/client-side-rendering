import type { FC, HTMLAttributes } from 'react'
import { css, cx } from '@emotion/css'

const Title: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...otherProps }) => {
  return (
    <h1 className={cx(style.wrapper, className)} {...otherProps}>
      {children}
    </h1>
  )
}

const style = {
  wrapper: css`
    font-weight: 500;
    color: var(--primary-color);
  `
}

export default Title
