"use client";

import React, { useState } from "react";
import { Play, RotateCcw, AlertTriangle, Settings, ShieldAlert, Zap, CheckCircle2 } from "@/components/Icons";
import { SwarmScenarioType } from "@/lib/types";
import { getNetworkConfig, ZGNetworkKey } from "@/lib/config";

const SCENARIOS = [
  { id: "defi_liquidity_arbitrage" as const, title: "DeFi: AMM Volatility & Arbitrage", tag: "High Volatility", tagColor: "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800/80", summary: "14.8% price skew on 0G/USDT. Swarm calculates 2-hop routing and 28 bps slippage ceiling." },
  { id: "zero_day_exploit_intercept" as const, title: "Security: 12M Flashloan Exploit", tag: "Threat Defense", tagColor: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80", summary: "Mempool adversarial flashloan detected. Swarm evaluates risk and triggers signed circuit breaker." },
  { id: "dao_treasury_allocation" as const, title: "DAO: $350k Grant & Phased Escrow", tag: "Governance", tagColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80", summary: "Evaluates proposal against DAO constitution with 3-tranche cryptographic milestone releases." },
  { id: "custom_sandbox" as const, title: "Sandbox: Custom Operator Directives", tag: "Interactive TEE", tagColor: "bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800/80", summary: "Dispatches custom directives concurrently across all 4 decentralized Llama-3.1 TEE enclaves." },
];

export const SwarmController: React.FC<{
  onRunSwarm: (opts: { scenario: SwarmScenarioType; quorumThreshold: number; injectRogueAgent: boolean; rogueTargetRole: "SENTINEL" | "ROUTER" | "GUARD" | "ARBITER"; customPrompt?: string }) => void;
  isLoading: boolean;
  activeNetwork?: ZGNetworkKey;
}> = ({ onRunSwarm, isLoading, activeNetwork = "mainnet" }) => {
  const currentNetwork = getNetworkConfig(activeNetwork);
  const [scenario, setScenario] = useState<SwarmScenarioType>("defi_liquidity_arbitrage");
  const [quorumThreshold, setQuorumThreshold] = useState<number>(75);
  const [injectRogueAgent, setInjectRogueAgent] = useState(false);
  const [rogueTargetRole, setRogueTargetRole] = useState<"SENTINEL" | "ROUTER" | "GUARD" | "ARBITER">("ROUTER");
  const [customPrompt, setCustomPrompt] = useState("");

  return (
    <div className="bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm dark:shadow-lg space-y-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Swarm Deliberation & BFT Consensus Deck</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">Consensus Mandate:</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-teal-700 dark:text-teal-300 font-semibold">
            {quorumThreshold}% Supermajority ({Math.ceil((quorumThreshold / 100) * 4)} of 4 TEE Enclaves)
          </span>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">Select Deliberation Scenario</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((sc) => {
            const isSel = scenario === sc.id;
            return (
              <button key={sc.id} type="button" onClick={() => setScenario(sc.id)} disabled={isLoading} className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${isSel ? "bg-teal-50 dark:bg-teal-950/30 border-teal-500 dark:border-teal-500/80 shadow-md ring-1 ring-teal-500/30" : "bg-slate-50 dark:bg-[#0a0f18] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/60"}`}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5"><span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${sc.tagColor}`}>{sc.tag}</span>{isSel && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}</div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">{sc.title}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{sc.summary}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {scenario === "custom_sandbox" && (
        <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-[#090d15] border border-slate-200 dark:border-white/[0.06]">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">Custom Operator Directive for 0G Compute Enclaves:</label>
          <input type="text" placeholder={`e.g. Inspect mempool for sandwich bots on ${currentNetwork.name}...`} value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} disabled={isLoading} className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-teal-500" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex justify-between items-center text-xs"><span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">Byzantine Quorum Threshold</span><span className="text-teal-600 dark:text-teal-400 font-mono font-bold">{quorumThreshold}% Quorum</span></div>
          <input type="range" min="50" max="100" step="25" value={quorumThreshold} onChange={(e) => setQuorumThreshold(Number(e.target.value))} disabled={isLoading} className="w-full accent-teal-600 dark:accent-teal-500 bg-slate-200 dark:bg-slate-800 cursor-pointer h-1.5 rounded-lg" />
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono"><span>50% (Majority)</span><span className="text-teal-600 dark:text-teal-300 font-semibold">• 75% (Supermajority)</span><span>100% (Unanimous)</span></div>
        </div>

        <div className={`p-3.5 rounded-xl border transition-colors ${injectRogueAgent ? "bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80" : "bg-slate-50 dark:bg-[#0a0f18] border-slate-200 dark:border-white/[0.06]"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5"><ShieldAlert className={`w-4 h-4 ${injectRogueAgent ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`} /><span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">Rogue Persona Injection Simulator</span></div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={injectRogueAgent} onChange={(e) => setInjectRogueAgent(e.target.checked)} disabled={isLoading} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>
          {injectRogueAgent ? (
            <div className="space-y-1.5">
              <select value={rogueTargetRole} onChange={(e) => setRogueTargetRole(e.target.value as any)} disabled={isLoading} className="w-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/80 rounded-lg px-2.5 py-1.5 text-xs text-rose-900 dark:text-rose-200 font-mono focus:outline-none">
                <option value="ROUTER">Compromise: AlphaRouter (Slippage Override Attack)</option>
                <option value="SENTINEL">Compromise: Sentinel-X (False Alarm Obstruction)</option>
                <option value="GUARD">Compromise: InvarGuard (Mathematical Obstruction)</option>
              </select>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 font-mono">All 4 TEE Enclaves Operating in Honest Consensus Mode.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Pipeline: 0G Compute (Llama-3.1) &rarr; 0G Storage (Turbo DA) &rarr; {currentNetwork.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {injectRogueAgent && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-mono font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /><span>Byzantine Fault Stress Active</span>
            </div>
          )}
          <button onClick={() => onRunSwarm({ scenario, quorumThreshold, injectRogueAgent, rogueTargetRole, customPrompt: scenario === "custom_sandbox" ? customPrompt : undefined })} disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs font-mono shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {isLoading ? <><RotateCcw className="w-4 h-4 animate-spin" /><span>Running Deliberation...</span></> : <><Play className="w-4 h-4 fill-current" /><span>Initiate Swarm Consensus</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};
