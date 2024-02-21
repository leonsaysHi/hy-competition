import { isDate, parseISO, format, add, getWeek } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

export function dateToUTCString(date: Date) {
  return format(add(date, { minutes: date.getTimezoneOffset() }), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
}
export function dateToTimeStamp(date: Date = new Date()) {
  return Timestamp.fromDate(isDate(date) ? date : parseISO(date))
}
export function dateToDayValue(date: Date) {
  return format(date, 'yyyy-MM-dd')
}
export function dateToWeekRef(date: Date) {
  return getWeek(date, { weekStartsOn: 1 }) + '-' + format(date, 'yy')
}
export function dateToTimeValue(date: Date) {
  return format(date, 'HH:mm')
}
