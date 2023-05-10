import type { NamespaceAuthTranslation } from '../../i18n-types';

const eng_auth: NamespaceAuthTranslation = {
    accountBlocked:
        "END Your PIN has been blocked. For assistance please call: {supportPhone}.",
    processingAccount:
        "END Your account is still being created. You will receive an SMS when your account is ready.",
    enteringPin:
        "CON Please enter a new four number PIN for your account:\n00. Exit",
    confirmingPin:
        "CON Enter your four number PIN again:\n00. Exit",
    mainMenu:
        "CON Balance: {balance|currency} {symbol}\n1. Send\n2. My Vouchers\n3. My Account\n4. Help",
    activationError:
        "END Please try again in a few minutes. If the problem persists, please contact {supportNumber|phone}",
    exit:
        "END Thank you for using Sarafu. Goodbye.",
}

export default eng_auth
