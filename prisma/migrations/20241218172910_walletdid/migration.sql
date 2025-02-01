-- CreateTable
CREATE TABLE "WalletDID" (
    "did" TEXT NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "bPK" TEXT NOT NULL,

    CONSTRAINT "WalletDID_pkey" PRIMARY KEY ("did")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletDID_bPK_key" ON "WalletDID"("bPK");

-- AddForeignKey
ALTER TABLE "WalletDID" ADD CONSTRAINT "WalletDID_bPK_fkey" FOREIGN KEY ("bPK") REFERENCES "User"("bPK") ON DELETE RESTRICT ON UPDATE CASCADE;
