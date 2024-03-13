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
export function getPerc(total: number, success: number) {
  return total ? numeral(success).divide(total).value() : 0
}
export function formatPerc(num: number) {
  return numeral(num).multiply(100).format('(0.0)')
}

export function getOrd(num: number) {
  const n = numeral(num)
  return n.format('0o').replace(num.toString(), '')
}
