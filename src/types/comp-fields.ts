export type Option = {
  text: string
  long?: string
  value: string | number | undefined | boolean
  disabled?: boolean
}
export type Size = 'lg' | 'md' | 'sm'
export type Variant =
  | 'primary'
  | 'outline-primary'
  | 'secondary'
  | 'outline-secondary'
  | 'light'
  | 'danger'
  | 'warning'
  | 'success'
  | 'dark'
  | 'link'
