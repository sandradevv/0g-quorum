"use client";

import React, { useState } from "react";
import { Cpu, Shield, CheckCircle2, Scale, Lock, Activity, Zap } from "@/components/Icons";
import { SwarmAgent, BFTConsensusState } from "@/lib/types";

interface SwarmTopologyVisualizerProps {
  agents: SwarmAgent[];
  consensusState?: BFTConsensusState;
  activeRound?: number;
  isDeliberating?: boolean;
}

export const SwarmTopologyVisualizer: React.FC<SwarmTopologyVisualizerProps> = ({
  agents,
  consensusState,
  activeRound = 1,
  isDeliberating = false,
}) => {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const getAgentRoleColor = (role: string) => {
    switch (role) {
      case "SENTINEL":
        return {
          stroke: "#f43f5e",
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/40",
          glow: "shadow-rose-500/20",
          text: "text-rose-400",
        };
      case "ROUTER":
        return {
          stroke: "#06b6d4",
          bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/40",
          glow: "shadow-cyan-500/20",
          text: "text-cyan-400",
        };
      case "GUARD":
        return {
          stroke: "#10b981",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
          glow: "shadow-emerald-500/20",
          text: "text-emerald-400",
        };
      case "ARBITER":
      default:
        return {
          stroke: "#a855f7",
          bg: "bg-violet-500/10 text-violet-400 border-violet-500/40",
          glow: "shadow-violet-500/20",
          text: "text-violet-400",
        };
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SENTINEL":
        return <Shield className="w-4 h-4 text-rose-400" />;
      case "ROUTER":
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case "GUARD":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "ARBITER":
      default:
        return <Scale className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#090d15] dark:bg-[#070a10] border border-slate-200 dark:border-teal-500/20 shadow-xl space-y-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06] relative z-10 font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Swarm Mesh Topology & Enclave Interconnect
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">0G DA Pipeline:</span>
          <span className="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800 font-bold">
            50 GB/s Synchronous Broadcast
          </span>
        </div>
      </div>

      {/* Interactive Visual Network Diagram (SVG Interconnect) */}
      <div className="relative py-4 px-2">
        {/* SVG Mesh Connections */}
        <svg className="w-full h-48 absolute inset-0 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="lineGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="lineGradCenter" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Diagonal & Horizontal Mesh Lines */}
          <line x1="20%" y1="28%" x2="80%" y2="28%" stroke="url(#lineGrad1)" strokeWidth="1.5" strokeDasharray={isDeliberating ? "4 4" : "none"} className={isDeliberating ? "animate-pulse" : ""} />
          <line x1="20%" y1="72%" x2="80%" y2="72%" stroke="url(#lineGrad2)" strokeWidth="1.5" strokeDasharray={isDeliberating ? "4 4" : "none"} className={isDeliberating ? "animate-pulse" : ""} />
          <line x1="20%" y1="28%" x2="80%" y2="72%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="20%" y1="72%" x2="80%" y2="28%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="20%" y1="28%" x2="20%" y2="72%" stroke="rgba(20,184,166,0.3)" strokeWidth="1.5" />
          <line x1="80%" y1="28%" x2="80%" y2="72%" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" />

          {/* Central 0G Consensus Hub Circle */}
          <circle cx="50%" cy="50%" r="28" fill="#0e1420" stroke="#14b8a6" strokeWidth="1.5" />
        </svg>

        {/* Central Hub Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center pointer-events-none text-center">
          <Lock className="w-3.5 h-3.5 text-teal-400 mb-0.5" />
          <span className="text-[9px] font-mono font-bold text-teal-300 uppercase tracking-tighter leading-none">
            0G BFT
          </span>
          <span className="text-[8px] font-mono text-slate-400 leading-none mt-0.5">
            Quorum Hub
          </span>
        </div>

        {/* 4 Agent Nodes Grid */}
        <div className="grid grid-cols-2 gap-y-16 gap-x-8 sm:gap-x-24 relative z-10">
          {agents.map((agent) => {
            const colors = getAgentRoleColor(agent.role);
            const isIsolated = consensusState?.isolatedAgents?.includes(agent.id);

            return (
              <div
                key={agent.id}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                className={`p-3.5 rounded-xl border transition-all duration-300 backdrop-blur-md shadow-lg ${
                  isIsolated
                    ? "bg-rose-950/60 border-rose-500 shadow-rose-900/40"
                    : hoveredAgent === agent.id
                    ? `${colors.bg} border-teal-400 shadow-teal-500/20 scale-[1.02]`
                    : "bg-[#0e1420]/90 border-white/[0.08] hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getRoleIcon(agent.role)}
                    <span className="text-xs font-bold text-slate-100">{agent.name}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isIsolated
                        ? "bg-rose-950 text-rose-300 border-rose-700"
                        : "bg-slate-900 text-slate-300 border-slate-700"
                    }`}
                  >
                    {isIsolated ? "ISOLATED" : agent.role}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1">
                  <span className="text-slate-500">TEE:</span>
                  <span className="text-teal-300 truncate">{agent.teeEnclaveId}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 mt-1 border-t border-white/[0.04]">
                  <span>Model: {agent.model.split("-")[0]}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Attested</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Telemetry Strip */}
      <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Llama-3.1-70B Private Enclaves &bull; ECDSA Attestation &bull; 0G Storage Merkle Verification</span>
        </div>
        <div className="flex items-center gap-2 text-teal-300 font-semibold">
          <span>Byzantine Tolerance: \(f &lt; \frac{'{n}'}{'{3}'}\)</span>
        </div>
      </div>
    </div>
  );
};
