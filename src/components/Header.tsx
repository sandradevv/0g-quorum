"use client";

import React from "react";
import { Logo } from "@/components/Logo";
import { Cpu, Database, Activity, Sun, Moon } from "@/components/Icons";
import { ZG_NETWORKS, ZGNetworkKey } from "@/lib/config";

const TABS = [
  { id: "overview", label: "Protocol Overview" },
  { id: "arena", label: "Swarm Console" },
  { id: "merkle", label: "0G Merkle Vault" },
  { id: "benchmark", label: "Storage Benchmark" },
] as const;

export const Header: React.FC<{
  blockNumber?: number;
  activeAgentsCount: number;
  totalTokensProcessed: number;
  activeScenarioTitle?: string;
  isDeliberating?: boolean;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  activeTab?: "overview" | "arena" | "merkle" | "benchmark";
  onSelectTab?: (tab: "overview" | "arena" | "merkle" | "benchmark") => void;
  activeNetwork?: ZGNetworkKey;
  onSelectNetwork?: (network: ZGNetworkKey) => void;
}> = ({
  blockNumber = 1849204,
  activeAgentsCount = 4,
  isDeliberating = false,
  theme = "dark",
  onToggleTheme,
  activeTab = "overview",
  onSelectTab,
  activeNetwork = "mainnet",
  onSelectNetwork,
}) => (
  <header className="border-b border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#080b11]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => onSelectTab?.("overview")} className="cursor-pointer hover:opacity-90 transition-opacity flex items-center text-left" title="0G Quorum Protocol">
          <Logo size="md" showBadge={false} />
        </button>
        {isDeliberating && (
          <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Deliberating
          </span>
        )}
      </div>

      {onSelectTab && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#0e1420] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-medium">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => onSelectTab(id)} className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === id ? "bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold shadow-xs border border-slate-200 dark:border-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}>
              {label}
            </button>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <div className="flex items-center bg-slate-100 dark:bg-[#0e1420] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.08]">
          <button onClick={() => onSelectNetwork?.("mainnet")} className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${activeNetwork === "mainnet" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeNetwork === "mainnet" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} /><span>Mainnet #16600</span>
          </button>
          <button onClick={() => onSelectNetwork?.("testnet")} className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${activeNetwork === "testnet" ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-xs" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeNetwork === "testnet" ? "bg-cyan-500 animate-pulse" : "bg-slate-400"}`} /><span>Galileo #16602</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /><span className="text-slate-500 dark:text-slate-400">Block:</span><span className="text-cyan-700 dark:text-cyan-300 font-medium tabular-nums">#{blockNumber.toLocaleString()}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /><span className="text-slate-500 dark:text-slate-400">Enclaves:</span><span className="text-violet-700 dark:text-violet-300 font-medium">{activeAgentsCount} Nodes</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
          <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /><span className="text-slate-500 dark:text-slate-400">0G DA:</span><span className="text-teal-700 dark:text-teal-300 font-medium">50 GB/s</span>
        </div>

        {onToggleTheme && (
          <button onClick={onToggleTheme} aria-label="Toggle Theme" className="flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 transition-all cursor-pointer shadow-xs">
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        )}
      </div>
    </div>
  </header>
);
