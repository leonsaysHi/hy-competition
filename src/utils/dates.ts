import type { DateFormats } from '@/types/utils'
import { isDate, parseISO, format, intervalToDuration } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

export function dateToTimeStamp(date: Date = new Date()) {
  return Timestamp.fromDate(isDate(date) ? date : parseISO(date))
}

export function formatDate(date: Date): DateFormats {
  const min = format(date, 'mm')
  const time = format(date, 'h') + (min !== '00' ? ':' + min : '') + format(date, 'aa')
  const short = format(date, 'do LLL')
  const long = format(date, 'iii, do LLL')
  const full = [long, time].join(' ')
  return {
    num: format(date, 'P'),
    short,
    long,
    full,
    time
  }
}

export function durationFormat(time: number):string {
  const { minutes = 0, seconds=0 } = intervalToDuration({ start: 0, end: time})
  return `${ minutes < 10 ? `0${minutes}` : minutes }:${ seconds < 10 ? `0${seconds}` : seconds }`
}
