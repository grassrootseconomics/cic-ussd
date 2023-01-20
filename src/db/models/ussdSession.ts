import {prisma} from "@db/client";

/** This function creates a ussd session in the database if it doesn't exist already
 * @param {string} externalId - The external id of the ussd session
 * @param {string} phoneNumber - The phone number associated with the ussd session
 * @returns {Promise<UssdSession>} - The ussd session
 * @throws {Error} if the ussd session already exists
 */
async function createPersistedUssdSession(phoneNumber: string, externalId: string) {
    return await prisma.ussdSession.create({
        data: { id: externalId, phoneNumber: phoneNumber}
    })
}

/**
 * This functions retrieves an ussd session from the database
 * @param {string} externalId - The external id of the ussd session
 * @returns {Promise<UssdSession>} - The ussd session
 * @throws {Error} if the ussd session doesn't exist
 */
async function findPersistedUssdSession(externalId: string) {
    return await prisma.ussdSession.findUnique({
        where: { id: externalId }
    })
}

/** This function updates an ussd session in the database
 * @param {string} externalId - The external id of the ussd session
 * @param {string} history - The history of the ussd session
 * @returns {Promise<UssdSession>} - The ussd session
 * @throws {Error} if the ussd session doesn't exist
 */
async function updatePersistedUssdSession(externalId: string, history : string) {
    return await prisma.ussdSession.update({
        where: { id: externalId },
        data: { history: history }
    })
}