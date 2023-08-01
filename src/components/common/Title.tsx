import type { FC, HTMLAttributes } from 'react'
import { css, cx } from '@emotion/css'

import Back from './Back'

export type TitleProps = HTMLAttributes<HTMLDivElement> & {
  back?: boolean
}

const Title: FC<TitleProps> = ({ className, back, children, ...otherProps }) => {
  return (
    <div className="items-center" {...otherProps}>
      {back && <Back className={style.back} />}

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
