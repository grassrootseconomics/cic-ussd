import { L } from './i18n-node';
import { Locales, NamespaceHelpersTranslation, NamespaceSmsTranslation } from './i18n-types';
import { baseLocale } from './i18n-util';
import { menuPages } from '@lib/ussd';


export const supportedLanguages = {
  en: 'English',
  sw: 'Swahili'
}

export function fallbackLanguage(){
  return baseLocale
}

export function getLanguage(input: string): Locales {
  const index = parseInt(input) - 1;
  return Object.keys(supportedLanguages)[index] as Locales;
}

export async function languageOptions () {
  const languages = Object.values(supportedLanguages)
    .map((language, index) => `${index + 1}. ${language}`)
  const placeholder = tHelpers("noMoreLanguageOptions", fallbackLanguage())
  return await menuPages(languages, placeholder)
}

export function tHelpers<K extends keyof NamespaceHelpersTranslation>(key: K, language: Locales, data?: any) {
  return L[language]["helpers"][key](data)
}

export function tSMS<K extends keyof NamespaceSmsTranslation>(key: K, language: Locales, data?: any) {
  return L[language]["sms"][key](data)
}

export async function translate(state: string, translator: any, data?: Record<string, any>): Promise<string> {
  if (data) {
    return translator[state](data);
  } else {
    return translator[state]();
  }
}