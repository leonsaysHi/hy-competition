export interface TableField {
  key: string
  label?: string
  sortable?: boolean
  tdClass?: string
  thClass?: string
}
export interface TableItem {
  [key: string]: string | boolean | number | {} | []
}
