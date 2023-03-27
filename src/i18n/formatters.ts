import type { FormattersInitializer } from 'typesafe-i18n';
import type { Formatters, Locales } from './i18n-types';

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {

	const formatters: Formatters = {
		currency: (value: number) => {
			return value.toFixed(2)
		},
		phone: (value: string) => {
			return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
		}
	}

	return formatters
}
