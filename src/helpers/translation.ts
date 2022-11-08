import { translator } from '../tools/i18n/i18n';
import { Locales, Translation } from '../types/locales';

export async function translate(locale : Locales, key : string, params : Record<string, string> = {}) {
  console.log('translate', locale, key, params);
  return translator[locale][key.toUpperCase() as keyof Translation](params);
}
