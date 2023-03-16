import { L } from './i18n-node'

export function tHelpers(key: string, language: string, data?: any) {
  if (data){
    return L[language]["helpers"][key](data)
  }
  return L[language]["helpers"][key]()
}