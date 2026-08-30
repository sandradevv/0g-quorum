"use client";

import React, { useState } from "react";
import { MessageSquare, Shield, Cpu, Scale, CheckCircle2, AlertCircle, Hash, Search, Info } from "@/components/Icons";
import { AgentDebateTurn, AgentRole } from "@/lib/types";

const ROLE_META: Record<AgentRole, { icon: React.ReactNode; style: string; label: string }> = {
  SENTINEL: { icon: <Shield className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />, style: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60", label: "Sentinel-X" },
  ROUTER: { icon: <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />, style: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60", label: "AlphaRouter" },
  GUARD: { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />, style: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60", label: "InvarGuard" },
  ARBITER: { icon: <Scale className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />, style: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60", label: "Arbiter" },
};

const MSG_BADGES: Record<string, { label: string; style: string }> = {
  PROPOSAL: { label: "PROPOSAL", style: "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800" },
  CHALLENGE: { label: "CHALLENGE", style: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800" },
  DEFENSE: { label: "DEFENSE", style: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" },
  VOTE_DECLARATION: { label: "VOTE", style: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800" },
};

export const SwarmDebateArena: React.FC<{
  turns: AgentDebateTurn[];
  selectedTurnId?: string;
  onSelectTurn: (turn: AgentDebateTurn) => void;
  isLoading?: boolean;
}> = ({ turns, selectedTurnId, onSelectTurn, isLoading = false }) => {
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTurnId, setExpandedTurnId] = useState<string | null>(null);

  const filteredTurns = turns.filter((turn) => {
    if (roleFilter !== "ALL" && turn.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return turn.statement.toLowerCase().includes(q) || turn.agentName.toLowerCase().includes(q) || turn.policyChecks.some((p) => p.ruleName.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm dark:shadow-lg flex flex-col h-full space-y-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Multi-Agent Deliberation Arena</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Displaying:</span>
          <span className="text-teal-600 dark:text-teal-300 font-bold tabular-nums">{filteredTurns.length} of {turns.length} Turns</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search statements, invariants, agent remarks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-[#090e18] border border-slate-300 dark:border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
        </div>
        <div className="flex items-center gap-1">
          {["ALL", "SENTINEL", "ROUTER", "GUARD", "ARBITER"].map((role) => (
            <button key={role} onClick={() => setRoleFilter(role)} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${roleFilter === role ? "bg-teal-100 dark:bg-teal-600/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40" : "bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-800"}`}>
              {role === "ALL" ? "All" : ROLE_META[role as AgentRole]?.label || role}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0a0f18] animate-shimmer space-y-3">
                <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-12 h-5 bg-slate-200 dark:bg-slate-800 rounded" /><div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded" /></div><div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></div>
                <div className="w-full h-10 bg-slate-200/80 dark:bg-slate-800/80 rounded" />
                <div className="w-3/4 h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : filteredTurns.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0a0f18] space-y-2">
            <Info className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">No Debate Turns Match Filter</h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-mono">Adjust search keywords or filters, or run a new deliberation.</p>
          </div>
        ) : (
          filteredTurns.map((turn) => {
            const isSelected = selectedTurnId === turn.id;
            const isExpanded = expandedTurnId === turn.id;
            const meta = ROLE_META[turn.role];
            const badge = MSG_BADGES[turn.messageType];

            return (
              <div key={turn.id} onClick={() => onSelectTurn(turn)} className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected ? "bg-teal-50/50 dark:bg-[#121b2a] border-teal-500 dark:border-teal-500/80 shadow-md ring-1 ring-teal-500/30" : "bg-slate-50 dark:bg-[#0a0f18] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#0c121e]"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400">R{turn.round}</span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${meta?.style}`}>{meta?.icon}<span>{turn.agentName}</span></div>
                    {badge && <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.style}`}>{badge.label}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums">{turn.reasoningTokens} tokens</span>
                    {turn.vote && <span className={`px-2 py-0.5 rounded font-bold border ${turn.vote.decision === "APPROVE" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800" : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800"}`}>{turn.vote.decision} ({turn.vote.confidence}%)</span>}
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed mb-3 font-sans">{turn.statement}</p>

                {turn.dataPoints && Object.keys(turn.dataPoints).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-[#060a10] border border-slate-200 dark:border-white/[0.04] text-[11px] font-mono mb-2">
                    {Object.entries(turn.dataPoints).map(([k, v]) => (
                      <div key={k} className="truncate"><span className="text-slate-500 dark:text-slate-400">{k}: </span><span className="text-teal-700 dark:text-teal-300 font-semibold">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span></div>
                    ))}
                  </div>
                )}

                {turn.policyChecks.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {turn.policyChecks.map((pc) => (
                      <div key={pc.ruleId} className={`flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-md border ${pc.passed ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40" : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"}`}>
                        {pc.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
                        <span className="font-bold">{pc.ruleName}:</span>
                        <span className="truncate">{pc.details}</span>
                      </div>
                    ))}
                  </div>
                )}

                {turn.proposedAction && (
                  <div className="mt-2 p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 text-[11px] font-mono space-y-1">
                    <div className="text-teal-800 dark:text-teal-300 font-bold flex items-center justify-between"><span>Proposed Calldata Payload:</span><span className="text-[10px] text-teal-600 dark:text-teal-400/80">{turn.proposedAction.type}</span></div>
                    {turn.proposedAction.calldataSummary && <div className="text-slate-700 dark:text-slate-300 break-all text-[10px] bg-white dark:bg-slate-950/60 p-1.5 rounded border border-teal-200 dark:border-teal-900/40">{turn.proposedAction.calldataSummary}</div>}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/[0.04]">
                  <div className="flex items-center gap-1.5 truncate max-w-md"><Hash className="w-3 h-3 text-slate-400 shrink-0" /><span className="truncate">Leaf Hash: {turn.leafHash}</span></div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setExpandedTurnId(isExpanded ? null : turn.id); }} className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-semibold cursor-pointer">
                    {isExpanded ? "Hide Raw State" : "View Context JSON"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-900 dark:bg-slate-950 border border-slate-800 space-y-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-400 font-bold"><span>Enclave State Parameters</span><span>Turn ID: {turn.id}</span></div>
                    <pre className="text-teal-300 overflow-x-auto text-[10px] leading-relaxed p-2 rounded bg-slate-950 dark:bg-[#070b12] border border-slate-800">{JSON.stringify(turn, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
