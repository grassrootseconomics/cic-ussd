import type { NamespaceVoucherTranslation } from '../../i18n-types'
import kam from '..'
import kam_main from '../main'

const { accountBlocked, exit } = kam
const { mainMenu } = kam_main

const kam_voucher: NamespaceVoucherTranslation = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Syoka',
  enteringPin:
    'CON Ikia PIN kusakua:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Syoka\n00. Uma',
  exit: exit,
  firstVoucherSet:
    'CON Sakua namba kana uvano kuma kwa mbalansi yaku:\n{vouchers}\n0. Syoka\n11. Mbele\n00. Uma',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON Sakua namba kana uvano kuma kwa mbalansi yaku:\n{vouchers}\n11. Mbee\n22. Syoka',
  setError:
    'END Kwena mathina ivinda ya kusakua voucher, tata ingi kavinda kangi.',
  setSuccess:
    'CON Woni waku niwetikilwa! {symbol} ii niyo Sarafu yaku ya kutumia\n0. Syoka\n9. Uma',
  thirdVoucherSet:
    'CON Sakua namba kana uvano kuma kwa mbalansi yaku:\n{vouchers}\n22. Syoka\n00. Uma',
  voucherMenu:
    'CON Voucher yakwa\n1. Sakua voucher\n2 Kimanyesyo cha voucher\n0. Syoka'
}

export default kam_voucher
