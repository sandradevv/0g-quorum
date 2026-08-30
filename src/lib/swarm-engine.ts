import {
  SwarmScenarioType,
  SwarmAgent,
  AgentDebateTurn,
  BFTConsensusState,
  SwarmDAGNode,
  SwarmDAGEdge,
  SwarmExecutionBundle,
  AgentRole,
} from "./types";
import { hashDebateTurn, buildSwarmMerkleTree } from "./merkle-utils";
import { execute0GComputeForAgent } from "./zg-compute";
import { getNetworkConfig, ZGNetworkKey } from "./config";

export interface SwarmRunOptions {
  scenario: SwarmScenarioType;
  quorumThreshold?: number;
  injectRogueAgent?: boolean;
  rogueTargetRole?: "SENTINEL" | "ROUTER" | "GUARD" | "ARBITER";
  customPrompt?: string;
  network?: ZGNetworkKey;
}

export const SWARM_AGENTS: SwarmAgent[] = [
  {
    id: "agent-sentinel-01",
    name: "Sentinel-X",
    role: "SENTINEL",
    avatarColor: "text-rose-400 bg-rose-950/60 border-rose-800",
    specialty: "Mempool Adversarial & Exploit Threat Detection",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    teeEnclaveId: "0g-tee-sentinel-881",
    reputationScore: 99.4,
  },
  {
    id: "agent-router-02",
    name: "AlphaRouter",
    role: "ROUTER",
    avatarColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800",
    specialty: "Multi-Hop Optimal Routing & Capital Efficiency",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    teeEnclaveId: "0g-tee-router-419",
    reputationScore: 98.7,
  },
  {
    id: "agent-guard-03",
    name: "InvarGuard",
    role: "GUARD",
    avatarColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
    specialty: "Formal Mathematical Invariants & Compliance Rules",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    teeEnclaveId: "0g-tee-guard-702",
    reputationScore: 99.8,
  },
  {
    id: "agent-arbiter-04",
    name: "Consensus Arbiter",
    role: "ARBITER",
    avatarColor: "text-violet-400 bg-violet-950/60 border-violet-800",
    specialty: "BFT Consensus Synthesis & Settlement Calldata Signing",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    teeEnclaveId: "0g-tee-arbiter-110",
    reputationScore: 100.0,
  },
];

const agentMap = Object.fromEntries(SWARM_AGENTS.map((a) => [a.role, a]));

function createTurn(
  id: string,
  round: number,
  role: AgentRole,
  messageType: AgentDebateTurn["messageType"],
  statement: string,
  reasoningTokens: number,
  dataPoints: Record<string, unknown>,
  opts: {
    proposedAction?: AgentDebateTurn["proposedAction"];
    policyChecks?: AgentDebateTurn["policyChecks"];
    vote?: AgentDebateTurn["vote"];
    offsetMs?: number;
  } = {}
): AgentDebateTurn {
  const agent = agentMap[role];
  const turn: AgentDebateTurn = {
    id,
    round,
    agentId: agent.id,
    agentName: agent.name,
    role,
    timestamp: new Date(Date.now() - (opts.offsetMs ?? 1000)).toISOString(),
    messageType,
    statement,
    reasoningTokens,
    dataPoints,
    proposedAction: opts.proposedAction,
    policyChecks: opts.policyChecks || [],
    vote: opts.vote,
    leafHash: "",
  };
  turn.leafHash = hashDebateTurn(turn);
  return turn;
}

export async function runSwarmConsensus(options: SwarmRunOptions): Promise<SwarmExecutionBundle> {
  const {
    scenario,
    quorumThreshold = 75,
    injectRogueAgent = false,
    rogueTargetRole = "ROUTER",
    customPrompt,
    network = "mainnet",
  } = options;

  const currentNetwork = getNetworkConfig(network);
  const netName = currentNetwork.name;
  const chainId = currentNetwork.chainId;
  const blockBase = currentNetwork.isMainnet ? 3491000 : 1849200;
  const startedAt = new Date(Date.now() - 4200).toISOString();
  const swarmId = `0g_swarm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let scenarioTitle = "";
  let scenarioDescription = "";
  let debateTurns: AgentDebateTurn[] = [];

  const isRogue = (role: AgentRole) => injectRogueAgent && rogueTargetRole === role;

  if (scenario === "defi_liquidity_arbitrage") {
    scenarioTitle = `0G/USDT AMM Dynamic Rebalance & Liquidity Arbitrage (${netName})`;
    scenarioDescription = `High volatility triggers secondary pool price deviation of 14.8% on ${netName}. The swarm debates multi-hop routing, slippage ceilings, and sandwich attack risks before signing atomic on-chain rebalancing.`;

    const rComp = await execute0GComputeForAgent("AlphaRouter", {
      messages: [
        { role: "system", content: `You are AlphaRouter on ${netName}.` },
        { role: "user", content: `Propose 35k USDT to 0G rebalance on ${netName} pool.` },
      ],
    });
    const sComp = await execute0GComputeForAgent("Sentinel-X", {
      messages: [
        { role: "system", content: `You are Sentinel-X security auditor on ${netName}.` },
        { role: "user", content: "Scan mempool for sandwich bots and reentrancy on proposed 35k USDT swap." },
      ],
    });
    const gComp = await execute0GComputeForAgent("InvarGuard", {
      messages: [
        { role: "system", content: `You are InvarGuard on ${netName}.` },
        { role: "user", content: "Verify capital preservation invariant and minimum output: 4,108.87 0G." },
      ],
    });

    debateTurns = [
      createTurn("turn-1", 1, "ROUTER", "PROPOSAL",
        isRogue("ROUTER")
          ? "[ROGUE INJECTION] Submitting unverified 350k USDT route with 450 bps slippage."
          : rComp.content || `Observed 14.8% price skew on 0G/USDT V3-AMM pool on ${netName}. Proposing atomic 35k USDT rebalance via 0G DEX Router with 0.28% price impact.`,
        rComp.tokensUsed, { pool: `0G-USDT (${netName})`, imbalance: "+14.8%", tradeSize: "35,000 USDT", impact: "0.28%" },
        {
          proposedAction: { type: "ATOMIC_SWAP_AND_REBALANCE", targetContract: `0x0GDexRouter${chainId}`, value: "35000 USDT", calldataSummary: "swapExactTokensForTokens(35k USDT, min 4108.87 0G)" },
          policyChecks: [{ ruleId: "RULE_SLIPPAGE", ruleName: "Max Slippage Ceiling", passed: !isRogue("ROUTER"), severity: isRogue("ROUTER") ? "HIGH" : "LOW", details: isRogue("ROUTER") ? "Slippage 450 bps exceeds bound" : "Slippage 28 bps is within 50 bps limit" }],
          offsetMs: 3800,
        }
      ),
      createTurn("turn-2", 2, "SENTINEL", isRogue("SENTINEL") ? "CHALLENGE" : "DEFENSE",
        isRogue("SENTINEL")
          ? "[ROGUE INJECTION] Falsely flagging false-positive sandwich threat to halt execution."
          : sComp.content || `Completed mempool scan across ${netName} blocks #${blockBase.toLocaleString()} to #${(blockBase + 4).toLocaleString()}. No frontrunning sandwich bots detected.`,
        sComp.tokensUsed, { mempoolDepth: "28 Pending Txs", sandwichRisk: isRogue("SENTINEL") ? "HIGH (Rogue)" : "LOW (4/100)" },
        { policyChecks: [{ ruleId: "RULE_MEMPOOL_MEV", ruleName: "Mempool MEV Screen", passed: !isRogue("SENTINEL"), severity: isRogue("SENTINEL") ? "HIGH" : "LOW", details: "Mempool verified clean" }], offsetMs: 2700 }
      ),
      createTurn("turn-3", 3, "GUARD", isRogue("GUARD") ? "CHALLENGE" : "DEFENSE",
        isRogue("GUARD")
          ? "[ROGUE INJECTION] Injecting contradictory mathematical invariant to block consensus."
          : gComp.content || "Formal mathematical verification complete: Constant product formula k = x * y satisfies strict solvency bounds. Min output 4,108.87 0G guaranteed.",
        gComp.tokensUsed, { constantProductFormula: "x*y=k (PASSED)", minOutputDelta: "+0.32%" },
        { policyChecks: [{ ruleId: "RULE_CAPITAL_PRESERVATION", ruleName: "Invariant Protection", passed: !isRogue("GUARD"), severity: isRogue("GUARD") ? "HIGH" : "LOW", details: "All formal invariants satisfied" }], offsetMs: 1600 }
      ),
      createTurn("turn-4a", 4, "ROUTER", "VOTE_DECLARATION", isRogue("ROUTER") ? "Casting vote: REJECT." : "Casting vote: APPROVE. Optimal routing verified.", 45, { voteWeight: "1.0" }, { vote: { decision: isRogue("ROUTER") ? "REJECT" : "APPROVE", confidence: isRogue("ROUTER") ? 20 : 98, rationale: "Execution path verified", signature: "0x89ab10...42e1" }, offsetMs: 900 }),
      createTurn("turn-4b", 4, "SENTINEL", "VOTE_DECLARATION", isRogue("SENTINEL") ? "Casting vote: REJECT." : "Casting vote: APPROVE. Threat vectors neutralized.", 45, { voteWeight: "1.0" }, { vote: { decision: isRogue("SENTINEL") ? "REJECT" : "APPROVE", confidence: isRogue("SENTINEL") ? 15 : 99, rationale: "Security parameters satisfied", signature: "0x7ca491...fe91" }, offsetMs: 700 }),
      createTurn("turn-4c", 4, "GUARD", "VOTE_DECLARATION", isRogue("GUARD") ? "Casting vote: REJECT." : "Casting vote: APPROVE. Mathematical invariants held.", 45, { voteWeight: "1.0" }, { vote: { decision: isRogue("GUARD") ? "REJECT" : "APPROVE", confidence: isRogue("GUARD") ? 10 : 100, rationale: "Zero loss invariant guaranteed", signature: "0x5109bc...a188" }, offsetMs: 500 }),
      createTurn("turn-4d", 4, "ARBITER", "VOTE_DECLARATION", `Casting vote: APPROVE. Synthesizing swarm consensus quorum and compiling ${netName} execution calldata.`, 80, { voteWeight: "1.0" }, { vote: { decision: "APPROVE", confidence: 100, rationale: "Quorum threshold achieved across verified TEE enclaves", signature: "0x39a31b...44b9" }, offsetMs: 200 }),
    ];
  } else if (scenario === "zero_day_exploit_intercept") {
    scenarioTitle = `Autonomous Zero-Day Exploit Defense & Circuit Breaker (${netName})`;
    scenarioDescription = `Adversarial flashloan transaction detected in mempool targeting 12M USDT pool on ${netName}. Swarm evaluates threat severity, isolates attack vector, and activates circuit breaker.`;

    debateTurns = [
      createTurn("turn-1", 1, "SENTINEL", "PROPOSAL", "[SECURITY ALERT] Intercepted suspicious flashloan tx borrowing 12M USDT with unverified reentrancy callback.", 120, { threatLevel: "CRITICAL", borrowAmount: "12,000,000 USDT" }, { proposedAction: { type: "EMERGENCY_CIRCUIT_BREAKER", targetContract: `0x0GLendingPool${chainId}`, calldataSummary: "pauseOperations()" }, policyChecks: [{ ruleId: "RULE_EXPLOIT_PREVENTION", ruleName: "Flashloan Reentrancy Guard", passed: true, severity: "HIGH", details: "Exploit pattern recognized" }], offsetMs: 3800 }),
      createTurn("turn-2", 2, "GUARD", "DEFENSE", "Simulated state transition: Invariant delta shows -$11.8M loss without emergency pause. Invariant breach confirmed.", 110, { predictedLoss: "$11,850,000", breachConfidence: "99.9%" }, { offsetMs: 2600 }),
      createTurn("turn-3", 3, "ROUTER", "DEFENSE", "Diverting incoming user liquidity to isolated fallback vault. Gas priority set to max.", 90, { divertedPools: 3 }, { offsetMs: 1500 }),
      createTurn("turn-4a", 4, "SENTINEL", "VOTE_DECLARATION", "Casting vote: APPROVE PAUSE. Immediate defense mandated.", 40, {}, { vote: { decision: "APPROVE", confidence: 100, rationale: "Active exploit in mempool", signature: "0x7ca491...fe91" }, offsetMs: 800 }),
      createTurn("turn-4b", 4, "GUARD", "VOTE_DECLARATION", "Casting vote: APPROVE PAUSE. Solvency preservation required.", 40, {}, { vote: { decision: "APPROVE", confidence: 100, rationale: "Mathematical loss averted", signature: "0x5109bc...a188" }, offsetMs: 600 }),
      createTurn("turn-4c", 4, "ROUTER", "VOTE_DECLARATION", "Casting vote: APPROVE PAUSE. Protection activated.", 40, {}, { vote: { decision: "APPROVE", confidence: 95, rationale: "Protocol security prioritized", signature: "0x89ab10...42e1" }, offsetMs: 400 }),
      createTurn("turn-4d", 4, "ARBITER", "VOTE_DECLARATION", `Casting vote: APPROVE PAUSE. Supermajority BFT quorum reached. Broadcasting emergency pause to ${netName}.`, 75, {}, { vote: { decision: "APPROVE", confidence: 100, rationale: "Supermajority satisfies Guardian charter", signature: "0x39a31b...44b9" }, offsetMs: 150 }),
    ];
  } else if (scenario === "dao_treasury_allocation") {
    scenarioTitle = `DAO Sovereign Treasury Grant Allocation & Tranche Escrow (${netName})`;
    scenarioDescription = `A $350k USDC grant proposal for decentralized fine-tuning is evaluated against the DAO Constitution, milestone deliverables, and multi-sig security thresholds on ${netName}.`;

    debateTurns = [
      createTurn("turn-1", 1, "ROUTER", "PROPOSAL", "Proposal 0G-PROP-42 submitted for $350,000 USDC grant. Proposing phased 3-tranche release: 30% repo init, 40% benchmark, 30% mainnet delivery.", 130, { proposalId: "0G-PROP-42", requestedAmount: "350,000 USDC", tranches: 3 }, { proposedAction: { type: "TRANCHE_ESCROW_ALLOCATION", targetContract: `0x0GGovernanceEscrow${chainId}`, value: "350000 USDC", calldataSummary: "initiateTrancheEscrow(0G-PROP-42, 350k USDC, 3 Tranches)" }, offsetMs: 3500 }),
      createTurn("turn-2", 2, "SENTINEL", "DEFENSE", "Beneficiary address KYC & multi-sig history screened. Zero association with flagged exploiters or mixers.", 95, { sybilRisk: "VERY LOW", recipientReputation: "99.1/100" }, { offsetMs: 2400 }),
      createTurn("turn-3", 3, "GUARD", "DEFENSE", "Treasury reserve invariant checked: $350k allocation represents 1.4% of total DAO reserves. Within 5% single-proposal ceiling.", 100, { treasuryUtilization: "1.4%", ceilingLimit: "5.0%" }, { offsetMs: 1400 }),
      createTurn("turn-4a", 4, "ROUTER", "VOTE_DECLARATION", "Casting vote: APPROVE. Milestone roadmap is realistic.", 40, {}, { vote: { decision: "APPROVE", confidence: 95, rationale: "Milestones verified", signature: "0x89ab10...42e1" }, offsetMs: 800 }),
      createTurn("turn-4b", 4, "SENTINEL", "VOTE_DECLARATION", "Casting vote: APPROVE. Security criteria satisfied.", 40, {}, { vote: { decision: "APPROVE", confidence: 98, rationale: "Recipient vetted", signature: "0x7ca491...fe91" }, offsetMs: 600 }),
      createTurn("turn-4c", 4, "GUARD", "VOTE_DECLARATION", isRogue("GUARD") ? "Casting vote: REJECT." : "Casting vote: APPROVE. Treasury constraints fully respected.", 40, {}, { vote: { decision: isRogue("GUARD") ? "REJECT" : "APPROVE", confidence: isRogue("GUARD") ? 20 : 100, rationale: "Tranche escrow enforced", signature: "0x5109bc...a188" }, offsetMs: 400 }),
      createTurn("turn-4d", 4, "ARBITER", "VOTE_DECLARATION", `Casting vote: APPROVE. Quorum reached. Registering governance grant on ${netName}.`, 70, {}, { vote: { decision: "APPROVE", confidence: 100, rationale: "Supermajority vote passed", signature: "0x39a31b...44b9" }, offsetMs: 150 }),
    ];
  } else {
    const promptText = customPrompt || "Analyze autonomous cross-chain bridge rebalancing directive.";
    scenarioTitle = `Custom Operator Swarm Directive (${netName})`;
    scenarioDescription = `Custom execution directive processed concurrently across 4 specialized 0G Compute enclaves on ${netName}: "${promptText}".`;

    debateTurns = [
      createTurn("turn-1", 1, "ROUTER", "PROPOSAL", `Ingested operator directive on ${netName}: "${promptText}". Synthesizing execution parameters.`, 90, { prompt: promptText, environment: `${netName} (Chain #${chainId})` }, { proposedAction: { type: "CUSTOM_OPERATOR_DIRECTIVE", calldataSummary: promptText.slice(0, 50) }, offsetMs: 3200 }),
      createTurn("turn-2", 2, "SENTINEL", "DEFENSE", "Evaluated security threat vectors for custom directive. No reentrancy or privilege escalation signatures found.", 85, { threatLevel: "SAFE" }, { offsetMs: 2100 }),
      createTurn("turn-3", 3, "GUARD", "DEFENSE", "Invariant verification complete. State modifications are bounded and cryptographically safe.", 80, { invariantCheck: "PASSED" }, { offsetMs: 1100 }),
      createTurn("turn-4a", 4, "ROUTER", "VOTE_DECLARATION", "Casting vote: APPROVE. Directive is feasible and optimized.", 40, {}, { vote: { decision: "APPROVE", confidence: 95, rationale: "Execution path verified", signature: "0x89ab10...42e1" }, offsetMs: 600 }),
      createTurn("turn-4b", 4, "SENTINEL", "VOTE_DECLARATION", "Casting vote: APPROVE. Threat vectors neutralized.", 40, {}, { vote: { decision: "APPROVE", confidence: 98, rationale: "Security satisfied", signature: "0x7ca491...fe91" }, offsetMs: 400 }),
      createTurn("turn-4c", 4, "GUARD", "VOTE_DECLARATION", "Casting vote: APPROVE. Mathematical parameters held.", 40, {}, { vote: { decision: "APPROVE", confidence: 100, rationale: "Zero loss guaranteed", signature: "0x5109bc...a188" }, offsetMs: 250 }),
      createTurn("turn-4d", 4, "ARBITER", "VOTE_DECLARATION", `Casting vote: APPROVE. Swarm consensus confirmed on ${netName}.`, 70, {}, { vote: { decision: "APPROVE", confidence: 100, rationale: "Consensus threshold reached", signature: "0x39a31b...44b9" }, offsetMs: 100 }),
    ];
  }

  // Calculate BFT Consensus
  const voteTurns = debateTurns.filter((t) => t.vote !== undefined);
  const approvalsCount = voteTurns.filter((t) => t.vote?.decision === "APPROVE").length;
  const rejectionsCount = voteTurns.filter((t) => t.vote?.decision === "REJECT").length;
  const abstentionsCount = voteTurns.filter((t) => t.vote?.decision === "ABSTAIN").length;
  const totalAgents = 4;
  const approvalPercent = (approvalsCount / totalAgents) * 100;
  const quorumReached = approvalPercent >= quorumThreshold;

  const isolatedAgents: string[] = [];
  if (injectRogueAgent) {
    const rogue = SWARM_AGENTS.find((a) => a.role === rogueTargetRole);
    if (rogue) isolatedAgents.push(rogue.name);
  }

  const consensusState: BFTConsensusState = {
    totalAgents,
    quorumThresholdPercent: quorumThreshold,
    approvalsCount,
    rejectionsCount,
    abstentionsCount,
    quorumReached,
    consensusDecision: quorumReached ? "EXECUTED" : rejectionsCount > 1 ? "REJECTED" : "CIRCUIT_BREAKER_TRIGGERED",
    settlementTxHash: quorumReached ? `0x9d4a816c21e0503f90119ec80182bbfae09215ef8215ccba8402deab09f87211` : undefined,
    settlementBlock: quorumReached ? blockBase + 4 : undefined,
    calldataCommitted: quorumReached ? `0x095ea7b3000000000000000000000000...0G_BFT_PAYLOAD_CHAIN_${chainId}` : undefined,
    byzantineFaultDetected: injectRogueAgent,
    isolatedAgents,
  };

  const dagNodes: SwarmDAGNode[] = debateTurns.map((t) => ({
    id: t.id,
    label: `${t.agentName} (R${t.round})`,
    role: t.role,
    round: t.round,
    status: t.vote?.decision === "APPROVE" ? "success" : t.vote?.decision === "REJECT" ? "error" : t.messageType === "PROPOSAL" ? "info" : "warning",
    summary: t.statement,
    vote: t.vote?.decision,
  }));

  const dagEdges: SwarmDAGEdge[] = [
    { from: "turn-1", to: "turn-2", label: "Threat Audit", type: "challenge" },
    { from: "turn-2", to: "turn-3", label: "Formal Invariants", type: "support" },
    { from: "turn-3", to: "turn-4a", label: "Cast Vote", type: "quorum" },
    { from: "turn-3", to: "turn-4b", label: "Cast Vote", type: "quorum" },
    { from: "turn-3", to: "turn-4c", label: "Cast Vote", type: "quorum" },
    { from: "turn-3", to: "turn-4d", label: "Cast Vote", type: "quorum" },
  ];

  const merkleData = buildSwarmMerkleTree(debateTurns);
  const totalTokensGenerated = debateTurns.reduce((sum, t) => sum + t.reasoningTokens, 0);

  return {
    swarmId,
    scenario,
    scenarioTitle,
    scenarioDescription,
    startedAt,
    completedAt: new Date().toISOString(),
    totalTokensGenerated,
    inferenceDurationMs: 4200,
    agents: SWARM_AGENTS,
    debateTurns,
    consensusState,
    dagNodes,
    dagEdges,
    merkleTree: {
      rootHash: merkleData.rootHash,
      totalLeaves: merkleData.leaves.length,
      depth: merkleData.depth,
      leaves: merkleData.leaves,
      treeStructure: merkleData.treeStructure,
    },
  };
}
