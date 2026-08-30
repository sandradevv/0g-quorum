import { NextRequest, NextResponse } from "next/server";
import { runSwarmConsensus } from "@/lib/swarm-engine";
import { uploadSwarmBundleTo0G } from "@/lib/zg-storage";
import { ZGNetworkKey } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scenario = "defi_liquidity_arbitrage",
      quorumThreshold = 75,
      injectRogueAgent = false,
      rogueTargetRole = "ROUTER",
      customPrompt,
      network = "mainnet",
    } = body;

    // 1. Run Multi-Agent Deliberation & BFT Consensus Engine
    const swarmBundle = await runSwarmConsensus({
      scenario,
      quorumThreshold,
      injectRogueAgent,
      rogueTargetRole,
      customPrompt,
      network: network as ZGNetworkKey,
    });

    // 2. Serialize & Anchor Swarm Bundle to 0G Storage (Mainnet or Testnet)
    const storageAnchor = await uploadSwarmBundleTo0G(
      swarmBundle as unknown as Record<string, unknown>,
      network as ZGNetworkKey
    );

    swarmBundle.storageAnchor = storageAnchor;

    return NextResponse.json({
      success: true,
      bundle: swarmBundle,
    });
  } catch (error) {
    console.error("Swarm run endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Swarm Server Error",
      },
      { status: 500 }
    );
  }
}
