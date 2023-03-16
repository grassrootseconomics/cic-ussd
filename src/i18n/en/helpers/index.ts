import type { NamespaceHelpersTranslation } from '../../i18n-types'

const en_helpers = {
	noMoreVouchers:
    "No more vouchers available.\n22. Back\n00. Exit",
	gender: {
    "MALE": "Gender: Male",
    "FEMALE": "Gender: Female",
  },
	age: "Age:",
	name: "Name:",
	location: "Location:",
	notProvided: "Not provided",
	debit: "You sent {value|currency} {symbol} to {recipient} {time},  received by: {sender}.",
	credit: "You received {value|currency} {symbol} from {sender} {time}, sent by: {recipient}.",
	noMoreTransactions: "No more transactions.",
	noMoreLanguageOptions: "No more language options.",
	noMoreGuardians: "No more guardians.",

} satisfies NamespaceHelpersTranslation

export default en_helpers
