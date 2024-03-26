import { format } from 'date-fns'

export const formatDateToURL = (rawDate: Date) => {
  return format(rawDate, 'yyyy-MM-dd')
}
