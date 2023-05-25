import type { FormattersInitializer } from 'typesafe-i18n';
import type { Formatters, Locales } from './i18n-types';
import { sanitizePhoneNumber } from '@lib/ussd';

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {

	const formatters: Formatters = {
		currency: (value: any) => {
			return value.toFixed(2)
		},
		phone: (value: any) => {
			return sanitizePhoneNumber(value, "KE")
		}
	}

	return formatters
}
