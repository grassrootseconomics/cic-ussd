import type { NamespaceHelpersTranslation } from '../../i18n-types';

const en_helpers = {
	age: 'Age:',
	credit: 'You received {value|currency} {symbol} from {sender} {time}.',
	debit: 'You sent {value|currency} {symbol} to {recipient} {time}.',
	female: 'Female',
	gender: 'Gender:',
	location: 'Location:',
	male: 'Male',
	name: 'Name:',
	noMoreGuardians: 'No more guardians.',
	noMoreLanguageOptions: 'No more language options.',
	noMoreTransactions: 'No more transactions.',
	noMoreVouchers:
		'No more vouchers available.\n22. Back\n00. Exit',
	notProvided: 'Not provided',
	services: 'You provide:',
	systemError:
		'END Sarafu is experiencing technical difficulties. Please try again later.'
} satisfies NamespaceHelpersTranslation

export default en_helpers
