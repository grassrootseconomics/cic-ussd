import { NamespaceRegistrationTranslation } from '../../i18n-types';
import swa from '..'

const { exit } = swa

const swa_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END Ombi lako la kusajiliwa haliwezi kukamilishwa. Tafadhali jaribu tena baadaye.',
  accountCreationSuccess:
    'END Akaunti yako ya Sarafu inatayarishwa. Utapokea ujumbe wa SMS akaunti yako ikiwa tayari.',
  exit: exit,
  firstLanguageSet:
    'CON Karibu Sarafu Network!\n{languages}\n00.Ondoka\n11. Mbele',
  secondLanguageSet:
    'CON Chagua lugha:\n{languages}\n11. Mbele\n22. Rudi\n00.Ondoka',
  thirdLanguageSet:
    'CON Chagua lugha:\n{languages}\n22. Rudi\n00.Ondoka'
}

export default swa_registration;