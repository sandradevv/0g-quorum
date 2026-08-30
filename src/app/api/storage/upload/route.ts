import { NextRequest, NextResponse } from "next/server";
import { uploadSwarmBundleTo0G } from "@/lib/zg-storage";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = await uploadSwarmBundleTo0G(payload);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload to 0G failed",
      },
      { status: 500 }
    );
  }
}
