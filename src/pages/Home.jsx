import { css, cx } from '@emotion/css'
import { Meta } from 'frontend-essentials'
import { Button, Switch, TextField, Select, MenuItem, Slider, Rating } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description } = pagesManifest.find(({ chunk }) => chunk === 'index')

const Home = () => {
  return (
    <div>
      <Meta
        title="Client-side Rendering"
        description={description}
        image={`${window.location.origin}/icons/og-icon.png`}
      />

      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <div className={style.inputs}>
        <Button className={style.input} variant="outlined">
          Button
        </Button>

        <Switch className={cx(style.input, style.switch)} defaultChecked />

        <TextField className={style.input} variant="outlined" />

        <Select className={style.input} value={10}>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>

        <Slider className={cx(style.input, style.slider)} />

        <Rating className={cx(style.input, style.rating)} value={4} />
      </div>
    </div>
  )
}

const style = {
  info: css`
    margin-top: 20px;
  `,
  inputs: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 20px;
  `,
  input: css`
    margin-top: 20px;
    color: #1976d2;

    .MuiOutlinedInput-notchedOutline {
      border: 1px solid rgba(25, 118, 210, 0.5);
    }
  `,
  switch: css`
    margin-left: -10px;
  `,
  slider: css`
    width: 200px;
    margin-left: 10px;
  `,
  rating: css`
    color: #1976d2;
  `
}

export default Home
