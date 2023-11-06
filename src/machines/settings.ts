import { createMachine } from 'xstate';
import { L } from '@i18n/i18n-node';
import {PostgresDb} from "@fastify/postgres";
import { Redis as RedisClient } from 'ioredis';
import {
    intermediateMachineTranslations,
    isOption1,
    isOption2,
    isOption3,
    isOption4,
    isOption5,
    isOption6,
    isSuccess,
    MachineEvent,
    MachineId,
    MachineInterface, NotifierContext
} from '@machines/utils';
import {translate} from "@i18n/translators";
import {sendSMS} from "@lib/ussd";
import {AccountService} from "@services/account";
import {config} from "@/config";


export interface SettingsContext extends NotifierContext {}

const stateMachine = createMachine<SettingsContext, MachineEvent>({
    id: MachineId.SETTINGS,
    initial: "settingsMenu",
    states: {
      balances: {
        description: 'Transitions to balances machine',
        type: 'final'
      },
      displayAddress: {
          description: 'Displays the address of the current user.',
          type: 'final',
          tags: 'resolved'
      },
      language: {
        description: 'Transitions to language machine',
        type: 'final'
      },
      mainMenu: {
        description: 'Transitions to main menu machine',
        type: 'final'
      },
      pinManagement: {
        description: 'Transitions to pin management machine',
        type: 'final'
      },
      profile: {
        description: 'Transitions to profile machine',
        type: 'final'
      },
      sendingAddress: {
        description: 'Sends user address to the user via SMS.',
        invoke: {
            id: 'sendingAddress',
            src: 'smsAddress',
            onDone: {  target: 'displayAddress', cond: 'isSuccess' },
            onError: { target: 'displayAddress' }
        },
        tags: 'invoked'
      },
      settingsMenu: {
        description: 'Displays account management menu.',
        on: {
          BACK: 'mainMenu',
          TRANSIT: [
            { target: 'profile', cond: 'isOption1' },
            { target: 'language', cond: 'isOption2' },
            { target: 'balances', cond: 'isOption3' },
            { target: 'statement', cond: 'isOption4' },
            { target: 'pinManagement', cond: 'isOption5' },
            { target: 'sendingAddress', cond: 'isOption6'}
          ]
        }
      },
      statement: {
        description: 'Transitions to statement machine',
        type: 'final'
      }
    }
},{
    guards: {
        isOption1,
        isOption2,
        isOption3,
        isOption4,
        isOption5,
        isOption6,
        isSuccess
    },
    services: {
        smsAddress
    }
})

export const settingsMachine: MachineInterface = {
  stateMachine,
  translate: intermediateMachineTranslations
}


async function updateAddressSmsThreshold(db: PostgresDb, redis: RedisClient, phoneNumber: string, threshold: number) {
    const thresholdKey = `address-sms-threshold-reset-${phoneNumber}`;
    const lastReset = await redis.get(thresholdKey);
    const thresholdResetTime = lastReset ? parseInt(lastReset, 10) : Date.now();

    if (Date.now() - thresholdResetTime > 86400000 || !lastReset) {
        threshold = 1;
        await redis.set(thresholdKey, Date.now().toString());
    }

    await new AccountService(db, redis).updateAddressSmsThreshold(threshold, phoneNumber);
}


async function smsAddress(context: SettingsContext) {
    const {
        connections: { db, redis},
        notifier,
        user: { account: { address, address_sms_threshold, language, phone_number }
        } } = context;

    if (address_sms_threshold && address_sms_threshold >= config.ADDRESS_SMS_THRESHOLD){
        console.warn(`SMS address threshold reached for ${phone_number}`);
        return { success: true };
    }

    const translator = L[language][MachineId.SETTINGS];
    let message: string = await translate('displayAddress', translator, { address });

    // remove END from message.
    message = message.replace(/END /g, '')

    // replace new line with space for SMS.
    message = message.replace(/\n/g, ' ');

    await sendSMS(message, notifier, [phone_number]);
    const threshold = address_sms_threshold ? address_sms_threshold + 1 : 1;
    await updateAddressSmsThreshold(db, redis.persistent, phone_number, threshold);
    return { success: true };
}