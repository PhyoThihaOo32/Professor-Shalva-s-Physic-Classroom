ALTER TABLE "User"
 ADD COLUMN "name" TEXT,
 ADD COLUMN "image" TEXT,
 ADD COLUMN "emailVerified" TIMESTAMP(3),
 ADD COLUMN "passwordHash" TEXT,
 ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "AuthAccount" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "provider" TEXT NOT NULL,
 "providerAccountId" TEXT NOT NULL,
 "type" TEXT NOT NULL,
 CONSTRAINT "AuthAccount_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "AuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AuthAccount_provider_providerAccountId_key" ON "AuthAccount"("provider", "providerAccountId");
CREATE INDEX "AuthAccount_userId_idx" ON "AuthAccount"("userId");
