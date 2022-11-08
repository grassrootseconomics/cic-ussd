import { i18n } from 'typesafe-i18n';

import {
  Formatters,
  Locales,
  Translation,
  Translations
} from '../../types/locales';

import en from './en'
import fr from './fr'
import sw from './sw'


/* Defines the locales that are available for the application. */
const locales: Locales[] = ['en', 'fr', 'sw']

/* Defines an object that maps the locales to their corresponding formatter
objects. */
export const loadedFormatters = {} as Record<Locales, Formatters>

/* Defines an object that maps the locales to their corresponding translation
objects.*/
const loadedLocales = {} as Record<Locales, Translation>

/* Defining a variable called `loadedFormatters` as an empty object that is of type*/
const localeTranslations = {
  en,
  fr,
  sw,
}

/**
 * A function that  loads a locale into the loadedLocales object
 * @param {Locales} locale - The locale to load.
 */
export const loadLocale = (locale: Locales): void => {
  if (loadedLocales[locale]) return
  loadedLocales[locale] = localeTranslations[locale] as unknown as Translations
}

/* Iterating over the `locales` array and calling the `loadLocale` function on each
item in the array. */
locales.forEach(loadLocale)

/* Exporting the `i18n` function from the `typesafe-i18n` package. */
export const translator = i18n(loadedLocales, loadedFormatters)
