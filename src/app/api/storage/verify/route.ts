import { NextRequest, NextResponse } from "next/server";
import { verify0GSwarmRoot } from "@/lib/zg-storage";
import { ZGNetworkKey } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rootHash, network = "mainnet" } = body;

    if (!rootHash) {
      return NextResponse.json(
        { success: false, error: "Root hash is required for 0G proof check." },
        { status: 400 }
      );
    }

    const verificationResult = await verify0GSwarmRoot(rootHash, network as ZGNetworkKey);

    return NextResponse.json({
      success: true,
      verification: verificationResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "0G Proof verification failed",
      },
      { status: 500 }
    );
  }
}
