-- AlterTable
ALTER TABLE "WorkflowRun" ADD COLUMN     "edges" JSONB,
ADD COLUMN     "nodesSnapshot" JSONB;
