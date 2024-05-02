import type { FC } from 'react'
import { css, keyframes } from '@emotion/css'

import pagesManifest from 'pages-manifest'
import Title from 'components/common/Title'
import Logo from 'images/logo.svg'

const { title } = pagesManifest.find(({ chunk }) => chunk === 'home')!

const Home: FC<{}> = () => {
  return (
    <div>
      <Title>{title}</Title>

      <Logo className={style.logo} />
    </div>
  )
}

const rotate = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(359deg) }
`

const style = {
  logo: css`
    display: block;
    width: 200px;
    margin: 25vh auto;
    animation: ${rotate} 5s linear infinite;
  `
}

export default Home
