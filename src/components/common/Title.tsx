import { css, cx } from '@emotion/css'

const Title = ({ className, children }) => {
  return <h1 className={cx(style.wrapper, className)}>{children}</h1>
}

const style = {
  wrapper: css`
    font-weight: 500;
    color: dodgerblue;
  `
}

export default Title
