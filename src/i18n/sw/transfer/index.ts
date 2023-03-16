import {NamespaceTransferTranslation} from "../../i18n-types";

const sw_transfer = {
    accountBlocked:
        "END PIN yako imefungwa. Kwa usaidizi tafadhali piga simu kwa: {supportPhone}.",
    enteringPin:
        "CON {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}\nTafadhali weka PIN yako kudhibitisha:",
    enteringAmount:
        "CON Kiwango cha juu: {spendable|currency}\nWeka kiwango:\n0. Rudi",
    enteringRecipient:
        "CON Weka nambari ya simu:\n0. Rudi",
    invalidRecipient:
        "CON {recipient} haijasajiliwa au sio sahihi, tafadhali weka tena:\n1.Karibisha kwa matandao wa Sarafu.\n9. Ondoka",
    inviteError:
        "END Ombi lako la kumwalika {invitee} kwa matandao wa Sarafu halikufaulu. Tafadhali jaribu tena baadaye.",
    inviteSuccess:
        "END Ombi lako la kumwalika {invitee} kwa matandao wa Sarafu limetumwa.",
    mainMenu:
        "CON Salio: {balance|currency} {symbol}\n1. Tuma\n2. Sarafu yangu\n3. Akaunti yangu\n4. Usaidizi",
    transferError:
        "END Ombi lako halikufaulu. Tafadhali jaribu tena baadaye.",
    transferInitiated:
        "END Ombi lako limetumwa. {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}.",
} satisfies NamespaceTransferTranslation

export default sw_transfer