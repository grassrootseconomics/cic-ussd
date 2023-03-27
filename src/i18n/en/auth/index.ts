import type { NamespaceAuthTranslation } from '../../i18n-types';

const en_auth = {
    accountBlocked:
        "END Your PIN has been blocked. For assistance please call: {supportPhone}.",
    processingAccount:
        "END Your account is still being created. You will receive an SMS when your account is ready.",
    enteringPin:
        "CON Please enter four number PIN:\n00. Exit",
    confirmingPin:
        "CON Enter your PIN again:\n00. Exit",
    mainMenu:
        "CON Balance: {balance|currency} {symbol}\n1. Send\n2. My Vouchers\n3. My Account\n4. Help",
    activationError:
        "END Please try again in a few minutes. If the problem persists, please contact {supportNumber|phone}",
    exit:
        "END Thank you for using Sarafu. Goodbye.",
} satisfies NamespaceAuthTranslation

export default en_auth
