import { css, cx } from '@emotion/css'

const Info = ({ className, children, ...otherProps }) => {
  return (
    <div className={cx(style.wrapper, className)} {...otherProps}>
      {children}
    </div>
  )
}

const style = {
  wrapper: css`
    display: inline-block;
    padding: 8px 10px;
    border-radius: 4px;
    color: white;
    background-color: dodgerblue;
  `
}

export default Info
