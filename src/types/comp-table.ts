export interface TableField {
  key: string
  label?: string
  sortable?: boolean
  tdClass?: string
  thClass?: string
  tfClass?: string
  sortByFormatted?: boolean
  formatter?: (value: string | undefined, item: {}, idx: number) => any
}
export interface TableItem {
  [key: string]: string | boolean | number | {} | []
}
