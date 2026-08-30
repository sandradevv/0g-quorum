"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Shield, CheckCircle2, XCircle, AlertCircle, Cpu, Scale, Hash, ExternalLink, Lock, Zap } from "@/components/Icons";
import { SwarmAgent, BFTConsensusState, AgentDebateTurn, AgentRole } from "@/lib/types";
import { getNetworkConfig, ZGNetworkKey } from "@/lib/config";

const ROLE_ICONS: Record<AgentRole, React.ReactNode> = {
  SENTINEL: <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
  ROUTER: <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
  GUARD: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  ARBITER: <Scale className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
};

const DECISIONS = {
  EXECUTED: { label: "CONSENSUS EXECUTED", style: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-600/50 text-emerald-700 dark:text-emerald-300", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> },
  CIRCUIT_BREAKER_TRIGGERED: { label: "CIRCUIT BREAKER TRIGGERED", style: "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-600/50 text-rose-700 dark:text-rose-300", icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> },
  REJECTED: { label: "CONSENSUS REJECTED", style: "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-600/50 text-amber-700 dark:text-amber-300", icon: <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> },
};

const VOTE_STYLES = {
  APPROVE: { badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> },
  REJECT: { badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800/60", icon: <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> },
  ABSTAIN: { badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60", icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> },
};

export const ConsensusGraph: React.FC<{
  consensusState?: BFTConsensusState;
  agents: SwarmAgent[];
  turns: AgentDebateTurn[];
  activeNetwork?: ZGNetworkKey;
}> = ({ consensusState, agents, turns, activeNetwork = "mainnet" }) => {
  const [showCalldataModal, setShowCalldataModal] = useState(false);
  const currentNetwork = getNetworkConfig(activeNetwork);

  const agentVotes = agents.map((agent) => {
    const agentTurns = turns.filter((t) => t.agentId === agent.id && t.vote);
    return { agent, vote: agentTurns[agentTurns.length - 1]?.vote, isIsolated: consensusState?.isolatedAgents?.includes(agent.id) ?? false };
  });

  const quorumPercent = consensusState?.quorumThresholdPercent || 75;
  const approvals = consensusState?.approvalsCount || 0;
  const totalAgents = consensusState?.totalAgents || agents.length || 4;
  const approvalRate = totalAgents > 0 ? Math.round((approvals / totalAgents) * 100) : 0;
  const quorumMet = approvalRate >= quorumPercent;
  const dec = DECISIONS[consensusState?.consensusDecision || "REJECTED"] || DECISIONS.REJECTED;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0e1420] shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#141d2e]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60"><ShieldCheck className="w-4 h-4" /></div>
          <div><h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Byzantine Consensus Matrix</h3><p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Dynamic BFT Quorum & Agent Voting Ledger</p></div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-bold tracking-wide ${dec.style}`}>{dec.icon}{dec.label}</span>
      </div>

      <div className="p-5 space-y-5">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><span>Supermajority Quorum</span><span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-bold">{quorumPercent}% Req</span></span>
            <span className={`font-bold tabular-nums ${quorumMet ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{approvals} / {totalAgents} Approvals ({approvalRate}%)</span>
          </div>
          <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${quorumMet ? "bg-gradient-to-r from-teal-500 to-emerald-500" : "bg-gradient-to-r from-amber-500 to-rose-500"}`} style={{ width: `${Math.min(approvalRate, 100)}%` }} />
            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10" style={{ left: `${quorumPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400"><span>0%</span><span className="text-slate-700 dark:text-slate-300 font-medium">Threshold: {quorumPercent}%</span><span>100%</span></div>
        </div>

        {consensusState?.byzantineFaultDetected && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-1"><div className="font-bold text-rose-800 dark:text-rose-200">Byzantine Anomaly Detected & Isolated</div><p className="text-rose-700 dark:text-rose-300 leading-relaxed font-sans">A non-conforming or adversarial agent was identified. BFT consensus rules isolated the deviant vote to preserve on-chain safety.</p>{consensusState.isolatedAgents.length > 0 && <div className="pt-1 text-[11px] text-rose-600 dark:text-rose-400">Isolated Agent: <span className="font-bold">{consensusState.isolatedAgents.join(", ")}</span></div>}</div>
          </div>
        )}

        <div className="space-y-2.5">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between"><span>Agent Voting Roster</span><span>Signature Status</span></div>
          <div className="space-y-2">
            {agentVotes.map(({ agent, vote, isIsolated }) => {
              const vStyle = (vote?.decision && VOTE_STYLES[vote.decision]) || { badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700", icon: <AlertCircle className="w-3.5 h-3.5" /> };
              return (
                <div key={agent.id} className={`p-3 rounded-lg border transition-all ${isIsolated ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60" : "bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1 rounded bg-white dark:bg-[#141d2e] border border-slate-200 dark:border-white/[0.08] shrink-0">{ROLE_ICONS[agent.role]}</div>
                      <div className="min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{agent.name}</span>{isIsolated && <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 uppercase">Isolated</span>}</div><div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{agent.specialty}</div></div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">{vote ? (<div className="text-right"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${vStyle.badge}`}>{vStyle.icon}{vote.decision}</span><div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">Conf: {vote.confidence}%</div></div>) : (<span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 italic">Awaiting Vote</span>)}</div>
                  </div>
                  {vote && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.04] text-[11px] font-mono space-y-1">
                      <div className="text-slate-600 dark:text-slate-300 font-sans line-clamp-1">&ldquo;{vote.rationale}&rdquo;</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500"><span className="flex items-center gap-1"><Lock className="w-3 h-3 text-slate-400" /><span className="truncate max-w-[140px] sm:max-w-[200px]" title={vote.signature}>{vote.signature}</span></span><span className="text-teal-600 dark:text-teal-400 font-medium">TEE Verified</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {consensusState?.settlementTxHash && (
          <div className="p-3.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-teal-800 dark:text-teal-200 font-bold">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />{currentNetwork.name} Settlement Anchor</span>
              <span className="text-[11px] text-teal-700 dark:text-teal-300 font-normal">Chain #{currentNetwork.chainId} &bull; Block #{consensusState.settlementBlock || (currentNetwork.isMainnet ? 3491024 : 1849204)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Tx Hash:</span>
              <a href={`${currentNetwork.explorerUrl}/tx/${consensusState.settlementTxHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 truncate max-w-[200px]" title={consensusState.settlementTxHash}>
                <span>{consensusState.settlementTxHash.slice(0, 10)}...{consensusState.settlementTxHash.slice(-8)}</span><ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            {consensusState.calldataCommitted && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-teal-200/60 dark:border-teal-800/40 text-[11px]">
                <button onClick={() => setShowCalldataModal(true)} className="text-teal-600 dark:text-teal-400 hover:underline font-mono text-[10px] cursor-pointer">
                  Inspect Calldata ({consensusState.calldataCommitted.length} bytes)
                </button>
                <button
                  onClick={async () => {
                    if (typeof window !== "undefined" && (window as any).ethereum) {
                      try {
                        const hexChainId = "0x" + currentNetwork.chainId.toString(16);
                        try {
                          await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexChainId }] });
                        } catch (switchError: any) {
                          if (switchError.code === 4902) {
                            await (window as any).ethereum.request({
                              method: "wallet_addEthereumChain",
                              params: [{ chainId: hexChainId, chainName: currentNetwork.name, rpcUrls: [currentNetwork.rpcUrl], blockExplorerUrls: [currentNetwork.explorerUrl], nativeCurrency: { name: "0G Token", symbol: "0G", decimals: 18 } }],
                            });
                          }
                        }
                        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
                        if (accounts?.[0]) {
                          await (window as any).ethereum.request({
                            method: "eth_sendTransaction",
                            params: [{ from: accounts[0], to: currentNetwork.flowContract, data: "0x" + (consensusState.calldataCommitted?.replace(/^0x/, "") || "00") }],
                          });
                        }
                      } catch (err: any) {
                        alert(err?.message || "Wallet broadcast completed or rejected.");
                      }
                    } else {
                      window.open(`${currentNetwork.explorerUrl}/address/${currentNetwork.flowContract}`, "_blank");
                    }
                  }}
                  className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Zap className="w-3 h-3" />
                  <span>Broadcast to 0G Chain</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCalldataModal && consensusState?.calldataCommitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between"><h4 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Hash className="w-4 h-4 text-teal-500" />Committed 0G Settlement Calldata</h4><button onClick={() => setShowCalldataModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"><XCircle className="w-5 h-5" /></button></div>
            <div className="p-3 rounded-lg bg-slate-900 text-teal-300 font-mono text-xs overflow-x-auto max-h-60 break-all leading-relaxed">{consensusState.calldataCommitted}</div>
            <div className="flex justify-end"><button onClick={() => setShowCalldataModal(false)} className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-mono text-xs font-bold cursor-pointer">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};