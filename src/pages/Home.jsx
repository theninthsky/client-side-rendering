import { css, cx } from '@emotion/css'
import { Button, Switch, TextField, Select, MenuItem, Slider } from '@mui/material'

import Title from 'components/common/Title'

const Home = () => {
  return (
    <div>
      <Title>Home</Title>

      <div className={style.inputs}>
        <Button className={style.input} variant="outlined">
          Button
        </Button>

        <Switch className={style.input} defaultChecked />

        <TextField className={style.input} variant="outlined" />

        <Select className={style.input} value={10}>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>

        <Slider className={cx(style.input, style.slider)} />
      </div>
    </div>
  )
}

const style = {
  inputs: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 20px;
  `,
  input: css`
    margin-top: 20px;
  `,
  slider: css`
    width: 200px;
  `
}

export default Home
