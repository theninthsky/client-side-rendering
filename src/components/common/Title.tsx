import type { FC, HTMLAttributes } from 'react'
import type { To } from 'react-router-dom'
import { css, cx } from '@emotion/css'

import Back from './Back'

export type TitleProps = HTMLAttributes<HTMLDivElement> & {
  redirectTo?: To
}

const Title: FC<TitleProps> = ({ className, redirectTo, children, ...otherProps }) => {
  return (
    <div className="items-center" {...otherProps}>
      {redirectTo && <Back className={style.back} to={redirectTo} />}

      <h1 className={cx(style.wrapper, className)}>{children}</h1>
    </div>
  )
}

const style = {
  wrapper: css`
    font-weight: 500;
    color: var(--primary-color);
  `,
  back: css`
    margin-right: 20px;
  `
}

export default Title
