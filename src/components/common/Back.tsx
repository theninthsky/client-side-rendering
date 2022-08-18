import type { FC, ButtonHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { css, cx } from '@emotion/css'

import BackIcon from 'images/back.svg'

const Back: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...otherProps }) => {
  const navigate = useNavigate()

  return (
    <button className="flex">
      <BackIcon className={cx(style.backIcon, className)} onClick={() => navigate(-1)} {...otherProps} />
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
