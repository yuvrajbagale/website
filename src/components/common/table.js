import React, { useEffect, useRef } from 'react'
import Tablesaw from 'tablesaw'
import DetailText from './detail-text'
import tableStyle from './table.module.scss'

const Table = ({ children, tableLabel, useTableSaw }) => {
  const tableRef = useRef()
  useEffect(() => {
    if (useTableSaw) {
      Tablesaw.init(tableRef.current)
    }
  }, [])
  return (
    <>
      {useTableSaw ? (
        <table
          ref={tableRef}
          className={tableStyle.table}
          data-tablesaw-sortable={useTableSaw}
          data-tablesaw-mode="columntoggle"
          data-tablesaw-minimap
        >
          {children}
        </table>
      ) : (
        <table className={tableStyle.table}>{children}</table>
      )}
      {tableLabel && <DetailText>{tableLabel}</DetailText>}
    </>
  )
}

export default Table
