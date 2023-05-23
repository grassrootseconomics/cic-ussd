import { NamespaceAuthTranslation } from '../../i18n-types';
import swa from '..';

const { accountBlocked, exit } = swa

const swa_auth: NamespaceAuthTranslation  = {
    accountBlocked: accountBlocked,
    activationError:
      'END Tafadhali jaribu tena baada ya dakika chache. Kama tatizo linaendelea, tafadhali wasiliana na {supportPhone|phone}.',
    confirmingPin:
      'CON Weka PIN yako tena:\n00. Ondoka',
    enteringPin:
      'CON Tafadhali weka pin mpya yenye nambari nne kwa akaunti yako:\n00. Ondoka',
    exit: exit,
    mainMenu:
      'CON Salio: {balance|currency} {symbol}\n1. Tuma\n2. Sarafu yangu\n3. Akaunti yangu\n4. Usaidizi',
    processingAccount:
      'END Akaunti yako ya Sarafu bado inatayarishwa. Utapokea ujumbe wa SMS akaunti yako ikiwa tayari.'
}

export default swa_auth