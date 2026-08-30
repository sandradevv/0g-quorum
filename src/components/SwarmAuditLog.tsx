"use client";

import React, { useState } from "react";
import { Terminal, Check, Copy } from "@/components/Icons";
import { SwarmExecutionBundle } from "@/lib/types";
import { getNetworkConfig, ZGNetworkKey } from "@/lib/config";

const LVL_COLORS = { TEE: "text-violet-400", MERKLE: "text-teal-400", CHAIN: "text-amber-400", INFO: "text-slate-400" };

export const SwarmAuditLog: React.FC<{
  bundle?: SwarmExecutionBundle;
  onCopy?: () => void;
  activeNetwork?: ZGNetworkKey;
}> = ({ bundle, onCopy, activeNetwork = "mainnet" }) => {
  const currentNetwork = getNetworkConfig(activeNetwork);
  const [copied, setCopied] = useState(false);
  const [levelFilter, setLevelFilter] = useState<"ALL" | "INFO" | "TEE" | "MERKLE" | "CHAIN">("ALL");

  if (!bundle) return null;

  const rawLogs = [
    { time: bundle.startedAt.split("T")[1]?.slice(0, 8) || "00:00:00", level: "INFO" as const, msg: `Swarm session ${bundle.swarmId} initiated for scenario: ${bundle.scenarioTitle}` },
    ...bundle.debateTurns.map((turn) => ({ time: turn.timestamp.split("T")[1]?.slice(0, 8) || "00:00:00", level: (turn.vote ? "TEE" : "INFO") as "INFO" | "TEE", msg: `[${turn.agentName} | ${turn.role}] ${turn.messageType}: "${turn.statement.slice(0, 90)}..." (Tokens: ${turn.reasoningTokens})` })),
    ...bundle.debateTurns.filter((t) => t.vote !== undefined).map((turn) => ({ time: turn.timestamp.split("T")[1]?.slice(0, 8) || "00:00:00", level: "TEE" as const, msg: `TEE Signed Vote: ${turn.agentName} -> ${turn.vote?.decision} (${turn.vote?.confidence}%) [Sig: ${turn.vote?.signature}]` })),
    { time: bundle.completedAt.split("T")[1]?.slice(0, 8) || "00:00:00", level: "MERKLE" as const, msg: `Swarm Merkle Tree compiled: Depth ${bundle.merkleTree.depth}, Leaves ${bundle.merkleTree.totalLeaves}, Root: ${bundle.merkleTree.rootHash}` },
    ...(bundle.storageAnchor ? [{ time: bundle.storageAnchor.timestamp.split("T")[1]?.slice(0, 8) || "00:00:00", level: "CHAIN" as const, msg: `0G Storage Upload Verified: Root ${bundle.storageAnchor.rootHash} anchored to ${bundle.storageAnchor.network || currentNetwork.name} Tx ${bundle.storageAnchor.txHash}` }] : []),
  ];

  const filteredLogs = rawLogs.filter((l) => levelFilter === "ALL" || l.level === levelFilter);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(filteredLogs.map((l) => `[${l.time}] [${l.level}] ${l.msg}`).join("\n"));
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm dark:shadow-lg space-y-3 font-mono text-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Streaming Cryptographic Telemetry Terminal</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#090d15] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.06] text-[10px]">
            {(["ALL", "INFO", "TEE", "MERKLE", "CHAIN"] as const).map((lvl) => (
              <button key={lvl} onClick={() => setLevelFilter(lvl)} className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${levelFilter === lvl ? "bg-teal-600 text-white dark:text-slate-950" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}>
                {lvl}
              </button>
            ))}
          </div>
          <button onClick={handleCopyLogs} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Log"}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-950 dark:bg-[#06090e] p-3.5 rounded-xl border border-slate-900 dark:border-white/[0.04] max-h-60 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed text-slate-300">
        {filteredLogs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2 font-mono">
            <span className="text-slate-500 shrink-0 tabular-nums">[{log.time}]</span>
            <span className={`font-bold shrink-0 ${LVL_COLORS[log.level] || "text-slate-400"}`}>[{log.level}]</span>
            <span className="text-slate-300 break-all">{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
