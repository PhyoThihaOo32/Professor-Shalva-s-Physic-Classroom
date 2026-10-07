CREATE TABLE "AiConnection" (
 "id" TEXT NOT NULL,
 "userId" TEXT,
 "guestId" TEXT,
 "encryptedKey" TEXT NOT NULL,
 "model" TEXT NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "AiConnection_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AiConnection_exactly_one_owner" CHECK (("userId" IS NULL) <> ("guestId" IS NULL))
);
CREATE UNIQUE INDEX "AiConnection_userId_key" ON "AiConnection"("userId");
CREATE UNIQUE INDEX "AiConnection_guestId_key" ON "AiConnection"("guestId");
ALTER TABLE "AiConnection" ADD CONSTRAINT "AiConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiConnection" ADD CONSTRAINT "AiConnection_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "GuestIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
