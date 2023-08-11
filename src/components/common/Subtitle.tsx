import type { FC, HTMLAttributes } from 'react'
import { css, cx } from '@emotion/css'
import Tooltip from 'components/common/Tooltip'

const Subtitle: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, title, children, ...otherProps }) => (
  <Tooltip title={title} placement="top">
    <h2 className={cx(style.wrapper, className)} {...otherProps}>
      {children}
    </h2>
  </Tooltip>
)

const style = {
  wrapper: css`
    font-size: 24px;
    font-weight: 500;
    cursor: pointer;
  `
}

export default Subtitle
