"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { ProtocolOverview } from "@/components/ProtocolOverview";
import { SwarmController } from "@/components/SwarmController";
import { SwarmTopologyVisualizer } from "@/components/SwarmTopologyVisualizer";
import { Swarm3DCanvas } from "@/components/Swarm3DCanvas";
import { SwarmDebateArena } from "@/components/SwarmDebateArena";
import { ConsensusGraph } from "@/components/ConsensusGraph";
import { SwarmTimeTravel } from "@/components/SwarmTimeTravel";
import { SwarmMerkleInspector } from "@/components/SwarmMerkleInspector";
import { SwarmBenchmark } from "@/components/SwarmBenchmark";
import { SwarmAuditLog } from "@/components/SwarmAuditLog";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { AlertTriangle, RotateCcw } from "@/components/Icons";
import { SwarmExecutionBundle, AgentDebateTurn, SwarmScenarioType } from "@/lib/types";
import { ZGNetworkKey, ZG_NETWORKS } from "@/lib/config";

const TABS = [
  { id: "overview" as const, label: "Protocol Overview" },
  { id: "arena" as const, label: "Swarm Deliberation Deck" },
  { id: "merkle" as const, label: "0G Merkle Tree Vault" },
  { id: "benchmark" as const, label: "0G Storage Benchmark" },
];

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeNetwork, setActiveNetwork] = useState<ZGNetworkKey>("mainnet");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bundle, setBundle] = useState<SwarmExecutionBundle | null>(null);
  const [selectedTurn, setSelectedTurn] = useState<AgentDebateTurn | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "arena" | "merkle" | "benchmark">("overview");
  const [topologyMode, setTopologyMode] = useState<"3d" | "2d">("3d");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("0g_quorum_theme") as "dark" | "light" | null;
    const initTheme = saved || "dark";
    setTheme(initTheme);
    document.documentElement.classList.toggle("dark", initTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("0g_quorum_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const addToast = (type: "success" | "warning" | "error" | "info", title: string, description?: string) => {
    setToasts((p) => [...p, { id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type, title, description }]);
  };

  const handleRunSwarm = async (opts: { scenario: SwarmScenarioType; quorumThreshold: number; injectRogueAgent: boolean; rogueTargetRole: "SENTINEL" | "ROUTER" | "GUARD" | "ARBITER"; customPrompt?: string }) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/swarm/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...opts, network: activeNetwork }) });
      const data = await res.json();
      if (data.success && data.bundle) {
        setBundle(data.bundle);
        if (data.bundle.debateTurns.length > 0) setSelectedTurn(data.bundle.debateTurns[0]);
        addToast("success", "Swarm Deliberation Finalized", `Consensus decision: ${data.bundle.consensusState.consensusDecision} (${data.bundle.consensusState.approvalsCount}/4 Signed Votes on ${ZG_NETWORKS[activeNetwork].name})`);
      } else {
        throw new Error(data.error || "Failed to execute swarm consensus");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error during deliberation";
      setErrorMsg(msg);
      addToast("error", "Deliberation Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunSwarm({ scenario: "defi_liquidity_arbitrage", quorumThreshold: 75, injectRogueAgent: false, rogueTargetRole: "ROUTER" });
  }, [activeNetwork]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#080b11] bg-grid-mesh text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        blockNumber={bundle?.consensusState?.settlementBlock || (activeNetwork === "mainnet" ? 3491024 : 1849204)}
        activeAgentsCount={bundle?.agents?.length || 4}
        totalTokensProcessed={bundle?.totalTokensGenerated || 0}
        activeScenarioTitle={bundle?.scenarioTitle}
        isDeliberating={isLoading}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeNetwork={activeNetwork}
        onSelectNetwork={(net) => { setActiveNetwork(net); addToast("info", `Switched to ${ZG_NETWORKS[net].name}`, `Routing through Chain #${ZG_NETWORKS[net].chainId}`); }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700/80 flex items-center justify-between gap-4 text-xs font-mono text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /><span>{errorMsg}</span></div>
            <button onClick={() => handleRunSwarm({ scenario: "defi_liquidity_arbitrage", quorumThreshold: 75, injectRogueAgent: false, rogueTargetRole: "ROUTER" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /><span>Retry</span></button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-2">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${activeTab === t.id ? "bg-teal-50 dark:bg-teal-600/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40 shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60"}`}>{t.label}</button>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5"><span>Settlement Target:</span><span className="font-bold text-slate-800 dark:text-slate-200">{ZG_NETWORKS[activeNetwork].name}</span></div>
        </div>

        {activeTab === "overview" && <ProtocolOverview onLaunchConsole={(id) => { setActiveTab("arena"); if (id) handleRunSwarm({ scenario: id as SwarmScenarioType, quorumThreshold: 75, injectRogueAgent: false, rogueTargetRole: "ROUTER" }); }} activeNetwork={activeNetwork} />}

        {activeTab === "arena" && (
          <div className="space-y-6">
            <SwarmController onRunSwarm={handleRunSwarm} isLoading={isLoading} activeNetwork={activeNetwork} />
            {bundle?.agents && (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Live Swarm Deliberation Topology</span><div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-white/[0.08] text-xs font-mono"><button onClick={() => setTopologyMode("3d")} className={`px-3 py-1 rounded-md font-bold cursor-pointer ${topologyMode === "3d" ? "bg-teal-600 text-white" : "text-slate-400"}`}>3D WebGL</button><button onClick={() => setTopologyMode("2d")} className={`px-3 py-1 rounded-md font-bold cursor-pointer ${topologyMode === "2d" ? "bg-teal-600 text-white" : "text-slate-400"}`}>2D Schema</button></div></div>
                {topologyMode === "3d" ? <Swarm3DCanvas agents={bundle.agents} consensusState={bundle.consensusState} isDeliberating={isLoading} /> : <SwarmTopologyVisualizer agents={bundle.agents} consensusState={bundle.consensusState} isDeliberating={isLoading} />}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7"><SwarmDebateArena turns={bundle?.debateTurns || []} selectedTurnId={selectedTurn?.id} onSelectTurn={(t) => setSelectedTurn(t)} isLoading={isLoading} /></div>
              <div className="lg:col-span-5"><ConsensusGraph consensusState={bundle?.consensusState} agents={bundle?.agents || []} turns={bundle?.debateTurns || []} activeNetwork={activeNetwork} /></div>
            </div>
            {bundle && bundle.debateTurns.length > 0 && <SwarmTimeTravel turns={bundle.debateTurns} />}
            <SwarmAuditLog bundle={bundle || undefined} activeNetwork={activeNetwork} onCopy={() => addToast("info", "Telemetry Copied", "Copied raw events to clipboard.")} />
          </div>
        )}

        {activeTab === "merkle" && (
          <div className="space-y-6">
            <SwarmMerkleInspector bundle={bundle || undefined} activeNetwork={activeNetwork} onProofVerified={(lat) => addToast("success", "0G Proof Verified", `Confirmed on ${ZG_NETWORKS[activeNetwork].name} in ${lat}ms.`)} />
            <SwarmAuditLog bundle={bundle || undefined} activeNetwork={activeNetwork} onCopy={() => addToast("info", "Telemetry Copied", "Copied raw events to clipboard.")} />
          </div>
        )}

        {activeTab === "benchmark" && (
          <div className="space-y-6">
            <SwarmBenchmark activeNetwork={activeNetwork} />
            <div className="p-5 rounded-xl bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] text-xs font-mono space-y-3 leading-relaxed shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Why 0G Network is Required for Multi-Agent Swarms</h3>
              <p className="text-slate-600 dark:text-slate-300 font-sans">Autonomous multi-agent swarms require frequent peer-to-peer message exchanges, intermediate reasoning token broadcasts, and Byzantine vote collections.</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400 pl-2">
                <li><strong className="text-slate-900 dark:text-slate-200">50 GB/s Throughput:</strong> 0G Storage provides high-bandwidth data availability for concurrent swarms.</li>
                <li><strong className="text-slate-900 dark:text-slate-200">Sub-Second Finality:</strong> 24ms commit latency ensures turn verification before timeouts expire.</li>
                <li><strong className="text-slate-900 dark:text-slate-200">Settlement Target:</strong> Operating on {ZG_NETWORKS[activeNetwork].name} (Chain #{ZG_NETWORKS[activeNetwork].chainId}) for atomic execution.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#06090e] py-4 text-center text-xs text-slate-500 font-mono transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Logo size="sm" showBadge={false} /><span className="text-slate-400 text-[11px]">&copy; 2026 — 0G Bridge Buildathon</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Active Settlement: {ZG_NETWORKS[activeNetwork].name} (Chain #{ZG_NETWORKS[activeNetwork].chainId})</span></div>
        </div>
      </footer>
    </div>
  );
}
