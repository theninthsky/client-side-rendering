import { injectGlobal } from '@emotion/css'

injectGlobal`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  input {
    font-family: inherit;
  }

  button {
    border: none;
    font-family: inherit;
    background-color: transparent;
    cursor: pointer;
  }

  p,
  span {
    word-break: break-word;
  }
`
