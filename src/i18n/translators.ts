import { L } from './i18n-node';
import { Locales, NamespaceHelpersTranslation } from './i18n-types';
import { baseLocale } from './i18n-util';

export function tHelpers<K extends keyof NamespaceHelpersTranslation>(key: K, language: Locales, data?: any) {
  return L[language]["helpers"][key](data) as string
}

export function fallbackLanguage(){
  return baseLocale
}