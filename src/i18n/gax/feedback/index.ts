import type { NamespaceFeedbackTranslation } from '../../i18n-types'
import gax from '..'

const { accountBlocked } = gax

const gax_feedback: NamespaceFeedbackTranslation = {
  accountBlocked,
  invalidAmount:
    'CON Agii atin ergite gudhaa ag athin argat ir. Mar dibii itdheeb\n0 Rudi',
  invalidGenderOption:
    'CON Nami at chaguat suninit. Mar dibii itdheeb\n1. Dir\n2. Naden\n3. Ka dibii\n0. Dheebi',
  invalidLanguageOption:
    'CON Afaan atin chaguat suninit. Mar dibii itdheebi\n{languages}\n0. Dheebi\n00. Bai\n11. Duur',
  invalidLocationOption:
    'CON fulaa at keet suninit. Mar dibii itdheeb\n0. Dheebi',
  invalidMarketplaceEntry:
    'CON Waan gurgurt okan naam keniit ka atkeet suninit. Mar dibii itdheeb\n0. Dheebi',
  invalidName:
    'CON Makkaan at keet suninit. Mar dibii itdheebi\n0. Dheebi',
  invalidNewPin:
    'CON PIN atin kekeet suninit Pin tantee lazima pin Karaati walinfakatiin. Qarqars feeth simu bilbil {supportPhone|phone}\n0. Dheebi ',
  invalidPin:
    'CON PIN tante suninit {remainingAttempts}Tanaataf\n0. Dheebi',
  invalidPinAtRegistration:
    'CON PIN atiin doft suninit pinin namba afur kataatu Qarqars feet simu bilbil {supportPhone|phone}\n00. Bai',
  invalidPinPC:
    'CON PIN tante suninit {remainingAttempts}Tanaataf\n0. Dheebi',
  invalidPinPV:
    'CON PIN tante suninit {remainingAttempts}Tanaataf\n0. Dheebi',
  invalidVoucher:
    'CON Vocha ka atiin chaguat suninit. Mar dibii itdheebi\n{vouchers}\n0. Dheebi\n11. Dhuur \n00 Bai',
  invalidYOBEntry:
    'CON ganni at dalat ka atkeet suninit. Mar dibii itdheebi\n0. Dheebi',
  pinMismatch:
    'CON Pin hareeti fi pin hareeti amaan tanaa walinfakaat Mar dibii itdheebi Qarqars feet simu bilbil {supportPhone|phone}\n0. Dheebi'
}

export default gax_feedback
