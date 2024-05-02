import { useMemo } from 'react'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest'
import NavigationLink from 'components/common/NavigationLink'

const Navigation = () => {
  const links = useMemo(
    () =>
      pagesManifest.map(({ path, title }) => (
        <NavigationLink key={path} to={path}>
          {title}
        </NavigationLink>
      )),
    [pagesManifest]
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
