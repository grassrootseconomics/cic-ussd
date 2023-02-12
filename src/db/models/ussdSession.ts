import { PrismaClient } from "@prisma/client";

async function createPersistedUssdSession(phoneNumber: string, db: PrismaClient, externalId: string) {
    return await db.ussdSession.create({
        data: { id: externalId, phoneNumber: phoneNumber}
    })
}


async function findPersistedUssdSession(db: PrismaClient, externalId: string) {
    return await db.ussdSession.findUnique({
        where: { id: externalId }
    })
}


async function updatePersistedUssdSession(db: PrismaClient, externalId: string, history : string) {
    return await db.ussdSession.update({
        where: { id: externalId },
        data: { history: history }
    })
}