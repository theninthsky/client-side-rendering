import { useMemo } from 'react'
import { css } from '@emotion/css'

import pages from 'pages'
import NavigationLink from 'components/common/NavigationLink'

const Navigation = () => {
  const links = useMemo(
    () =>
      pages.map(({ path, title }) => (
        <NavigationLink key={path} to={path}>
          {title}
        </NavigationLink>
      )),
    [pages]
  )

  return <div className={style.wrapper}>{links}</div>
}

const style = {
  wrapper: css`
    display: flex;
    align-items: center;
    padding: 15px;
    box-shadow: 3px 0px 6px 0px #00000029;
  `
}

export default Navigation
