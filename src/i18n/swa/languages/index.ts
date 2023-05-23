import { NamespaceLanguagesTranslation } from '../../i18n-types';
import swa from '..';

const { accountBlocked, exit } = swa

const swa_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError:
    'END Tatizo limetokea wakati wa kubadilisha lugha, tafadhali jaribu tena baadaye.',
  changeSuccess:
    'CON Ombi lako la kubadilisha lugha limefanikiwa.\n0. Rudi\n9. Ondoka',
  enteringPin:
    'CON Tafadhali weka PIN:\n0. Rudi',
  exit: exit,
  firstLanguageSet:
    'CON Chagua lugha:\n{languages}\n0. Rudi\n00.Ondoka\n11. Mbele',
  secondLanguageSet:
    'CON Chagua lugha:\n{languages}\n11. Mbele\n22. Rudi\n00.Ondoka',
  thirdLanguageSet:
    'CON Chagua lugha:\n{languages}\n22. Rudi\n00.Ondoka'

}

export default swa_languages