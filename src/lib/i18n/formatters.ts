import type { FormattersInitializer } from 'typesafe-i18n'

import type { Formatters, Locales } from './i18n-types'

export const initFormatters: FormattersInitializer<Locales, Formatters> = (
  locale: Locales
) => {
  const formatters: Formatters = {
    currency: (value: number) => {
      return value.toFixed(2)
    }
  }

  return formatters
}
