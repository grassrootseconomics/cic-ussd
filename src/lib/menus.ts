import { transferMachine } from '@machines/transfer';
import { voucherMachine } from '@machines/voucher';
import { settingsMachine } from '@machines/settings';
import { socialRecoveryMachine } from '@machines/socialRecovery';
import { profileMachine } from '@machines/profile';
import { languagesMachine } from '@machines/languages';
import { balancesMachine } from '@machines/balances';
import { statementMachine } from '@machines/statement';
import { pinManagementMachine } from '@machines/pins';
import { machines } from '@services/machine';
import { mainMachine } from '@machines/main';


type Menu = Record<string, typeof machines[number]> & { default: typeof machines[number] };

export class ActorMenu {
  private readonly menu: Menu;

  constructor(menu: Menu) {
    this.menu = menu;
  }

  async jumpTo(menuOption: string) {
    return this.menu[menuOption] || this.menu.default;
  }
}

export function createMenu(
  menuOptions: Record<string, typeof machines[number]>,
  defaultMachine: typeof machines[number]
): ActorMenu {
  return new ActorMenu({ ...menuOptions, default: defaultMachine });
}

export const mainMenu = createMenu(
  {
    "1": transferMachine,
    "2": voucherMachine,
    "3": settingsMachine,
  },
  mainMachine
);

export const pinManagementMenu = createMenu(
  {
    "3": socialRecoveryMachine,
  },
  pinManagementMachine
);

export const settingsMenu = createMenu(
  {
    "1": profileMachine,
    "2": languagesMachine,
    "3": balancesMachine,
    "4": statementMachine,
    "5": pinManagementMachine,
  },
  settingsMachine
);

