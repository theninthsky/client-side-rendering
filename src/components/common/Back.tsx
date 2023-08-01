import type { FC, HTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { css, cx } from '@emotion/css'

import BackIcon from 'images/back.svg'

const Back: FC<HTMLAttributes<HTMLButtonElement>> = ({ className, ...otherProps }) => {
  const navigate = useNavigate()

  return (
    <button className="flex" onClick={() => navigate(-1)} {...otherProps}>
      <BackIcon className={cx(style.backIcon, className)} />
    </button>
  )
}

const style = {
  backIcon: css`
    width: 18px;
    color: var(--primary-color);
  `
}

export default Back
