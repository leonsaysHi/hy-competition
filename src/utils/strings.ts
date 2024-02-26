export function stringIncludes(valueStr: string, searchStr: string) {
  if (!valueStr || !searchStr) {
    return false
  }
  const value = valueStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return value.toUpperCase().includes(searchStr.toUpperCase())
}
