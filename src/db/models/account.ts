import { PrismaClient } from "@prisma/client";


async function createPersistedAccount(phoneNumber: string, db: PrismaClient) {
    return await db.account.create({
        data: { phoneNumber}
    })
}

async function getPersistedAccount(phoneNumber: string, db: PrismaClient) {
    return await db.account.findUnique({
        where: { phoneNumber }, select : {id: true, phoneNumber: true}
    })
}