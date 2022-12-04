import { Meta } from 'frontend-essentials'
import { css, cx } from '@emotion/css'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description } = pagesManifest.find(({ chunk }) => chunk === 'periodic-sync')

const WebVitals = () => {
  const { syncTime } = localStorage

  return (
    <div>
      <Meta title={`${title} | Client-side Rendering`} description={description} />

      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      {window.matchMedia('(display-mode: standalone)').matches ? (
        <span className={style.syncTime}>
          Last sync time:{' '}
          {syncTime
            ? `${new Date(syncTime).toLocaleDateString('en-GB')} ${new Date(syncTime).toLocaleTimeString()}`
            : 'Never'}
        </span>
      ) : (
        <span className={cx(style.syncTime, style.alert)}>App not installed.</span>
      )}
    </div>
  )
}

const style = {
  info: css`
    margin-top: 20px;
  `,
  syncTime: css`
    display: block;
    margin-top: 20px;
  `,
  alert: css`
    color: red;
  `
}

export default WebVitals
