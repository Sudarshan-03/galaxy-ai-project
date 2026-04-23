-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeExecution" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeLabel" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "inputs" JSONB,
    "outputs" JSONB,
    "error" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" DOUBLE PRECISION,

    CONSTRAINT "NodeExecution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NodeExecution" ADD CONSTRAINT "NodeExecution_runId_fkey" FOREIGN KEY ("runId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
