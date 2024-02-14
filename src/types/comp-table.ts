export interface TableField {
  key: string
  label?: string
  sortable?: boolean
}
export interface TableItem {
  [key: string]: string | boolean | number | {} | []
}
