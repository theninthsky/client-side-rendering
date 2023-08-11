import type { FC, HTMLAttributes } from 'react'
import { css } from '@emotion/css'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table'

import Subtitle from './Subtitle'

export type TableProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  columns: ColumnDef<any, any>[]
  data: any[]
}

const Table: FC<TableProps> = ({ className, name, columns, data, ...otherProps }) => {
  const { getHeaderGroups, getRowModel } = useReactTable({ columns, data, getCoreRowModel: getCoreRowModel() })

  return (
    <div className={className} {...otherProps}>
      <Subtitle className={style.subtitle}>{name}</Subtitle>

      <table className={style.table}>
        <thead>
          {getHeaderGroups().map(({ id, headers }) => (
            <tr key={id}>
              {headers.map(({ id, column, getContext }) => (
                <th key={id}>{flexRender(column.columnDef.header, getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {getRowModel().rows.map(({ id, getVisibleCells }) => (
            <tr key={id}>
              {getVisibleCells().map(({ id, column, getContext }) => (
                <td key={id}>{flexRender(column.columnDef.cell, getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const style = {
  subtitle: css`
    cursor: default;
  `,
  table: css`
    margin-top: 10px;
    border-collapse: collapse;

    th,
    td {
      border: 1px solid lightgray;
    }

    th {
      padding: 8px;
      font-weight: 500;
      color: var(--primary-color);
    }

    td {
      padding: 6px;
    }
  `
}

export default Table
