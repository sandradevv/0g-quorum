import { ethers } from "ethers";
import { AgentDebateTurn, SwarmMerkleNode } from "./types";

export function hashDebateTurn(turn: AgentDebateTurn): string {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify({
    id: turn.id, round: turn.round, agentId: turn.agentId, role: turn.role,
    statement: turn.statement, dataPoints: turn.dataPoints,
    proposedAction: turn.proposedAction, policyChecks: turn.policyChecks, vote: turn.vote,
  })));
}

export function hashPair(left: string, right: string): string {
  const [a, b] = left < right ? [left, right] : [right, left];
  return ethers.keccak256(ethers.concat([a, b]));
}

export function buildSwarmMerkleTree(turns: AgentDebateTurn[]): {
  rootHash: string;
  leaves: string[];
  depth: number;
  treeStructure: SwarmMerkleNode;
} {
  if (turns.length === 0) {
    const emptyHash = ethers.keccak256(ethers.toUtf8Bytes("EMPTY_SWARM_TREE"));
    return { rootHash: emptyHash, leaves: [], depth: 0, treeStructure: { hash: emptyHash, type: "root", label: "Swarm Consensus Root (Empty)", verified: true } };
  }

  let currentLevel: SwarmMerkleNode[] = turns.map((t) => ({
    hash: t.leafHash || hashDebateTurn(t),
    type: "leaf",
    label: `Round ${t.round}: ${t.agentName}${t.vote ? ` [Vote: ${t.vote.decision}]` : ""}`,
    dataSummary: t.statement.slice(0, 80) + "...",
    verified: true,
  }));

  const leaves = currentLevel.map((n) => n.hash);
  let depth = 1;

  while (currentLevel.length > 1) {
    const nextLevel: SwarmMerkleNode[] = [];
    depth++;
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      if (i + 1 < currentLevel.length) {
        const right = currentLevel[i + 1];
        nextLevel.push({ hash: hashPair(left.hash, right.hash), type: "branch", label: `Swarm Branch L${depth}`, verified: true, children: [left, right] });
      } else {
        const padded: SwarmMerkleNode = { ...left, hash: ethers.keccak256(ethers.toUtf8Bytes(`${left.hash}_PAD`)), label: `${left.label} (Padded)` };
        nextLevel.push({ hash: hashPair(left.hash, padded.hash), type: "branch", label: `Swarm Branch L${depth}`, verified: true, children: [left, padded] });
      }
    }
    currentLevel = nextLevel;
  }

  const rootNode = { ...currentLevel[0], type: "root" as const, label: "0G Swarm Consensus Root" };
  return { rootHash: rootNode.hash, leaves, depth, treeStructure: rootNode };
}

export function generateMerkleProof(leaves: string[], targetIndex: number): string[] {
  const proof: string[] = [];
  let current = [...leaves], idx = targetIndex;
  while (current.length > 1) {
    const siblingIdx = idx % 2 === 1 ? idx - 1 : idx + 1;
    proof.push(siblingIdx < current.length ? current[siblingIdx] : current[idx]);
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(hashPair(current[i], i + 1 < current.length ? current[i + 1] : current[i]));
    }
    current = next;
    idx = Math.floor(idx / 2);
  }
  return proof;
}

export function verifyMerkleProof(leaf: string, proof: string[], root: string): boolean {
  return proof.reduce((cur, sib) => hashPair(cur, sib), leaf).toLowerCase() === root.toLowerCase();
}
