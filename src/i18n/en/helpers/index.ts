import type { NamespaceHelpersTranslation } from '../../i18n-types';

const en_helpers = {
	noMoreVouchers:
    "No more vouchers available.\n22. Back\n00. Exit",
	gender: "Gender:",
	male: "Male",
	female: "Female",
	age: "Age:",
	name: "Name:",
	location: "Location:",
	notProvided: "Not provided",
	debit: "You sent {value|currency} {symbol} to {recipient} {time}.",
	credit: "You received {value|currency} {symbol} from {sender} {time}.",
	noMoreTransactions: "No more transactions.",
	noMoreLanguageOptions: "No more language options.",
	noMoreGuardians: "No more guardians.",
	systemError:
    "END Sarafu is experiencing technical difficulties. Please try again later.",
} satisfies NamespaceHelpersTranslation

export default en_helpers
