import type { FC } from 'react'
import { css } from '@emotion/css'
import { DataGrid, DataGridProps } from '@mui/x-data-grid'

import Subtitle from './Subtitle'

export type TableProps = DataGridProps & {
  name: string
}

const Table: FC<TableProps> = ({ className, name, ...otherProps }) => {
  return (
    <div className={className}>
      <Subtitle className={style.subtitle}>{name}</Subtitle>

      <DataGrid className={style.table} {...otherProps} />
    </div>
  )
}

const style = {
  subtitle: css`
    cursor: default;
  `,
  table: css`
    margin-top: 10px;
  `
}

export default Table
