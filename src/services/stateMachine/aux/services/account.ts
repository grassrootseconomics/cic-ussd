import { createTracker, CustodialTaskType } from "@db/models/custodailTasks";
import { createDBAccount } from "@db/models/account";
import { CicGraph } from "@lib/graph/base";
import { InterfaceType } from "@lib/types/graph/user";
import { AccountType } from "@lib/types/graph/account";
import { createWallet } from "@lib/custodail/base";
import { UssdContext } from "@utils/context";

export async function initiateAccountCreation(context: UssdContext) {

    const db = context.db;

    // register account on custodial service
    const wallet = await createWallet()

    // create tracker for register task
    await createTracker(db, {
      blockchain_address: wallet.result.publicKey,
      task_type: CustodialTaskType.CREATE_ACCOUNT,
      task_reference: wallet.result.trackingId
    });

    // create account in database
    const account = await createDBAccount(db, {
      blockchain_address: wallet.result.publicKey,
      phone_number: context.phoneNumber,
      preferred_language: context.data.preferredLanguage,
    });

    // create user in graph
    const graph = new CicGraph();
    const graphUser = await graph.createUser({
      activated: false,
      interface_identifier: String(account.id),
      interface_type: InterfaceType.USSD,
    });

    // create account in graph
    await graph.createAccount({
      account_type: AccountType.CUSTODIAL_PERSONAL,
      blockchain_address: wallet.result.publicKey,
      user_identifier: graphUser.id
    });


}