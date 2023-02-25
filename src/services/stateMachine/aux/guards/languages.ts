import { UssdContext } from "@utils/context";

export const supportedLanguages = {
  "1": 'en',
  "2": 'sw',
  "fallback": 'sw'
}

export const languagesRendered ={
  "en": 'English',
  "sw": 'Swahili',
}


export function isValidLanguageOption(context: UssdContext) {
  const { actorInput } = context;
  return Object.keys(supportedLanguages).includes(actorInput);
}
