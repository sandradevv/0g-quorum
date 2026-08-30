export type SwarmScenarioType =
  | "defi_liquidity_arbitrage"
  | "zero_day_exploit_intercept"
  | "dao_treasury_allocation"
  | "custom_sandbox";

export type AgentRole = "SENTINEL" | "ROUTER" | "GUARD" | "ARBITER";

export interface SwarmAgent {
  id: string;
  name: string;
  role: AgentRole;
  avatarColor: string;
  specialty: string;
  model: string;
  teeEnclaveId: string;
  reputationScore: number;
}

export type VoteDecision = "APPROVE" | "REJECT" | "ABSTAIN";

export interface AgentDebateTurn {
  id: string;
  round: number;
  agentId: string;
  agentName: string;
  role: AgentRole;
  timestamp: string;
  messageType: "PROPOSAL" | "CHALLENGE" | "DEFENSE" | "VOTE_DECLARATION";
  statement: string;
  reasoningTokens: number;
  dataPoints: Record<string, unknown>;
  proposedAction?: {
    type: string;
    targetContract?: string;
    value?: string;
    calldataSummary?: string;
  };
  policyChecks: {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    details: string;
  }[];
  vote?: {
    decision: VoteDecision;
    confidence: number; // 0 - 100
    rationale: string;
    signature: string;
  };
  leafHash: string;
}

export interface BFTConsensusState {
  totalAgents: number;
  quorumThresholdPercent: number; // e.g., 75%
  approvalsCount: number;
  rejectionsCount: number;
  abstentionsCount: number;
  quorumReached: boolean;
  consensusDecision: "EXECUTED" | "REJECTED" | "CIRCUIT_BREAKER_TRIGGERED";
  settlementTxHash?: string;
  settlementBlock?: number;
  calldataCommitted?: string;
  byzantineFaultDetected: boolean;
  isolatedAgents: string[];
}

export interface SwarmMerkleNode {
  hash: string;
  type: "root" | "round" | "branch" | "leaf";
  label: string;
  dataSummary?: string;
  verified: boolean;
  children?: SwarmMerkleNode[];
}

export interface SwarmDAGNode {
  id: string;
  label: string;
  role: AgentRole;
  round: number;
  status: "success" | "warning" | "error" | "info";
  summary: string;
  vote?: VoteDecision;
}

export interface SwarmDAGEdge {
  from: string;
  to: string;
  label?: string;
  type?: "challenge" | "support" | "quorum";
}

export interface SwarmExecutionBundle {
  swarmId: string;
  scenario: SwarmScenarioType;
  scenarioTitle: string;
  scenarioDescription: string;
  startedAt: string;
  completedAt: string;
  totalTokensGenerated: number;
  inferenceDurationMs: number;
  agents: SwarmAgent[];
  debateTurns: AgentDebateTurn[];
  consensusState: BFTConsensusState;
  dagNodes: SwarmDAGNode[];
  dagEdges: SwarmDAGEdge[];
  merkleTree: {
    rootHash: string;
    totalLeaves: number;
    depth: number;
    leaves: string[];
    treeStructure: SwarmMerkleNode;
  };
  storageAnchor?: {
    rootHash: string;
    txHash: string;
    indexerRpc: string;
    sizeBytes: number;
    verified: boolean;
    timestamp: string;
    network?: string;
  };
}
