-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "blockchainAddress" TEXT,
    "custodialEntity" TEXT,
    "graphId" TEXT,
    "password" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "preferredLanguage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UssdSession" (
    "id" TEXT NOT NULL,
    "history" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UssdSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_blockchainAddress_key" ON "Account"("blockchainAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Account_graphId_key" ON "Account"("graphId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_phoneNumber_key" ON "Account"("phoneNumber");
