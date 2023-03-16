import type {FormattersInitializer} from 'typesafe-i18n'
import type {Formatters, Locales} from './i18n-types'
import L from './i18n-node'

interface ProfileValue {
	input: {
		key: string,
		value: number | string | null
	},
	language: string
}

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {

	const formatters: Formatters = {
		currency: (value: number) => {
			return value.toFixed(2)
		},
		phone: (value: string) => {
			return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
		},
		profileValue: (value: ProfileValue) => {
			const {language, input} = value
			const translator = L[language]["helpers"]
			if (input === null) {
				return translator["notProvided"]()
			}
			if (input.key === "gender") {
				return `${translator.gender[input.value]()}`
			}
			return `${translator[input.key]()} ${input.value}`
		}
	}

	return formatters
}
