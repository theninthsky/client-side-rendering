import type { FC, HTMLAttributes } from 'react'
import { If } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import Back from './Back'

export type TitleProps = HTMLAttributes<HTMLDivElement> & {
  backButton?: boolean
}

const Title: FC<TitleProps> = ({ className, backButton, children, ...otherProps }) => {
  return (
    <div className="items-center">
      <If condition={backButton}>
        <Back className={style.back} />
      </If>

      <h1 className={cx(style.wrapper, className)} {...otherProps}>
        {children}
      </h1>
    </div>
  )
}

const style = {
  wrapper: css`
    font-weight: 500;
    color: var(--primary-color);
  `,
  back: css`
    margin-right: 14px;
  `
}

export default Title
