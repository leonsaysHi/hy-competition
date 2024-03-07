import numeral from 'numeral'
// numeral.locale('es')

export function add(total: number, a: number) {
  return total + a
}
export function getAvg(total: number, length: number) {
  return numeral(total).divide(length).value()
}
export function formatAvg(num: number) {
  return numeral(num).format('0.0')
}

export function getOrd(num: number) {
  const n = numeral(num)
  return n.format('0o').replace(num.toString(), '')
}
