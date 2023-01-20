import {prisma} from "@db/client";

/** This function creates a new account in the database if it doesn't exist already
 * @param {string} phoneNumber - The phone number of the account
 * @returns {Promise<Account>} - The account
 * @throws {Error} if the account already exists
 */
async function createPersistedAccount(phoneNumber: string) {
    return await prisma.account.create({
        data: { phoneNumber}
    })
}


/**
 * This functions retrieves an account from the database
 * @param {string} phoneNumber - The phone number of the account
 * @returns {Promise<Account>} - The account
 * @throws {Error} if the account doesn't exist
 */
async function getPersistedAccount(phoneNumber: string) {
    return await prisma.account.findUnique({
        where: { phoneNumber }, select : {id: true, phoneNumber: true}
    })
}