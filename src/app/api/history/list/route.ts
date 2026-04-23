import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const runs = await prisma.workflowRun.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        executions: true,
      }
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
