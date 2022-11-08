import { RequiredParams } from 'typesafe-i18n';

export type Locales = 'en' | 'fr' | 'sw'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
  START: RequiredParams<'balance'>
}

export type Formatters = {}

