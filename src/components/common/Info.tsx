import { css } from '@emotion/css'

const Info = ({ children, ...otherProps }) => {
  return (
    <div className={style.wrapper} {...otherProps}>
      {children}
    </div>
  )
}

const style = {
  wrapper: css`
    color: white;
    background-color: dodgerblue;
  `
}

export default Info
