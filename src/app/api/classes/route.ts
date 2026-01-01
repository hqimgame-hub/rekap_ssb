
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const classes = await prisma.class.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(classes);
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch classes", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
