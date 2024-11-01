-- CreateTable
CREATE TABLE "User" (
    "bPK" TEXT NOT NULL,
    "email" TEXT,
    "given_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("bPK")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_bPK_key" ON "User"("bPK");
