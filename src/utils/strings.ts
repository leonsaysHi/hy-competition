export function stringIncludes(valueStr: string, searchStr: string) {
  if (!valueStr || !searchStr) {
    return false
  }
  const value = valueStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return value.toUpperCase().includes(searchStr.toUpperCase())
}
export function getAbbrev(str: string) {
  const splitted = str.split(' ')
  if (splitted.length) {
    return splitted
      .map((str) => str.substring(0, 3))
      .join('')
      .slice(0, 3)
  } else {
    return str.substring(0, 3)
  }
}
