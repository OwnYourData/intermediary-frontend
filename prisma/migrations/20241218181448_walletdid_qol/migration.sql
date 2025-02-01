/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[did]` on the table `WalletDID` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "WalletDID" DROP CONSTRAINT "WalletDID_bPK_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WalletDID_did_key" ON "WalletDID"("did");

-- AddForeignKey
ALTER TABLE "WalletDID" ADD CONSTRAINT "WalletDID_bPK_fkey" FOREIGN KEY ("bPK") REFERENCES "User"("bPK") ON DELETE CASCADE ON UPDATE CASCADE;
