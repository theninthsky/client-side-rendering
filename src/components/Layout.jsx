import { memo } from 'react'
import { css } from '@emotion/css'

import { MOBILE_VIEWPORT } from 'styles/constants'

const Layout = ({ children }) => {
  return <div className={style.wrapper}>{children}</div>
}

const style = {
  wrapper: css`
    height: 100%;
    position: relative;
    margin: 20px;

    @media ${MOBILE_VIEWPORT} {
      margin: 0;
    }
  `
}

export default memo(Layout)
