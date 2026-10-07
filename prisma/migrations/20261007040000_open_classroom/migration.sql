-- Keep existing reference sessions intact; open conversations have no assigned problem.
ALTER TABLE "Session" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'problem';
ALTER TABLE "Session" ALTER COLUMN "problemVersionId" DROP NOT NULL;
ALTER TABLE "Session" ADD CONSTRAINT "Session_problem_kind" CHECK (
 ("kind" = 'problem' AND "problemVersionId" IS NOT NULL)
 OR ("kind" = 'open-classroom' AND "problemVersionId" IS NULL)
);
CREATE INDEX "Session_kind_personaVersionId_updatedAt_idx" ON "Session"("kind", "personaVersionId", "updatedAt");
