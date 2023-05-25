import type { NamespaceAuthTranslation } from '../../i18n-types'
import luo from '..'
import luo_main from '../main'

const { accountBlocked, exit } = luo
const { mainMenu } = luo_main

const luo_auth: NamespaceAuthTranslation = {
  accountBlocked: accountBlocked,
  activationError:
    'END Tem kendo bang seche manok. Ka chandruok osiko to goch e {supportPhone|phone}.',
  confirmingPin:
    'CON Ket namba ni mopondo manyien kendo:\n00. Wuod',
  enteringPin:
    'CON Kiyie to ket namba ni mopondo manyien e akaunt ni:\n00. Wuok',
  exit: exit,
  mainMenu: mainMenu,
  processingAccount:
    'END Akaunt mari podi iloso. Ibroyudo ote ka akaunt mari oselos.'
}

export default luo_auth
