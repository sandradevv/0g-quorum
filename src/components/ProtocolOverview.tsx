"use client";

import React from "react";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Cpu, Database, ArrowRight, Shield, Scale, CheckCircle2, AlertTriangle, Zap, Activity } from "@/components/Icons";
import { ZGNetworkKey, getNetworkConfig } from "@/lib/config";

const PROBLEMS = [
  "Prompt Injection & Hallucinations: A single agent can be manipulated by adversarial mempool inputs or noisy market feeds.",
  "No Cryptographic Audit Trail: Traditional AI tools lack verifiable provenance for how or why transactions were executed.",
  "Storage Bottlenecks: Archiving reasoning logs on IPFS/Filecoin takes seconds to minutes, causing timeout desync.",
];

const SOLUTIONS = [
  "4-Agent Deliberation Pipeline: Proposals are stress-tested by a dedicated security sentinel and formal invariant verifier.",
  "0G Turbo DA Merkle Trees: Every turn is compiled into a Keccak256 hierarchical Merkle tree and verified on 0G Storage.",
  "Byzantine Fault Tolerance: Rogue or compromised agents are isolated automatically; quorum requires verified TEE signatures.",
];

const PERSONAS = [
  { name: "AlphaRouter", role: "PROPOSAL", icon: <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />, border: "border-cyan-200 dark:border-cyan-800/40", badge: "bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800", desc: "Execution optimization specialist. Calculates multi-hop liquidity routing, slippage ceilings, and optimal swap pathways on 0G DEX pools.", rule: "Mandate: Slippage ≤ 30 bps" },
  { name: "Sentinel-X", role: "SECURITY", icon: <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />, border: "border-rose-200 dark:border-rose-800/40", badge: "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800", desc: "Adversarial threat hunter. Scans on-chain mempool for sandwich bots, flashloan reentrancy attacks, and rogue calldata manipulation.", rule: "Mandate: Circuit Breaker Trigger" },
  { name: "InvarGuard", role: "INVARIANTS", icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, border: "border-emerald-200 dark:border-emerald-800/40", badge: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800", desc: "Formal mathematics verifier. Verifies constant-product pool invariants (k = x * y), treasury reserve balance ratios, and price impact bounds.", rule: "Mandate: Δk ≥ 0 Invariant Hold" },
  { name: "Arbiter", role: "SYNTHESIS", icon: <Scale className="w-4 h-4 text-violet-600 dark:text-violet-400" />, border: "border-violet-200 dark:border-violet-800/40", badge: "bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800", desc: "BFT consensus synthesizer. Aggregates signed TEE votes, calculates supermajority quorum, and dispatches atomic settlement payload to 0G Network.", rule: "Mandate: 75% Supermajority Quorum" },
];

const STEPS = [
  { step: "STEP 1: INGEST & COMPUTE", title: "0G Compute Enclaves", desc: "Agents run Llama-3.1 models in decentralized TEE nodes, generating verifiable debate statements and signed cryptographic votes.", color: "text-teal-600 dark:text-teal-400" },
  { step: "STEP 2: MERKLE TREE COMPILATION", title: "Keccak256 Leaf Hashing", desc: "Every debate turn, policy check, and signature is hashed into leaf nodes and structured into a binary Merkle tree root.", color: "text-cyan-600 dark:text-cyan-400" },
  { step: "STEP 3: 0G STORAGE DA", title: "50 GB/s Data Availability", desc: "The full audit bundle is committed to 0G Storage Indexer via Turbo DA SDK, enabling instant sub-second verification across storage nodes.", color: "text-amber-600 dark:text-amber-400" },
  { step: "STEP 4: ON-CHAIN SETTLEMENT", title: "0G Smart Settlement", desc: "The Arbiter posts the Merkle root and approved action calldata to 0G smart contracts for atomic on-chain execution.", color: "text-emerald-600 dark:text-emerald-400" },
];

export const ProtocolOverview: React.FC<{
  onLaunchConsole: (scenarioId?: string) => void;
  activeNetwork?: ZGNetworkKey;
}> = ({ onLaunchConsole, activeNetwork = "mainnet" }) => {
  const currentNetwork = getNetworkConfig(activeNetwork);

  return (
    <div className="space-y-12 py-2">
      {/* 1. HERO */}
      <section className="relative rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#0e1420]/80 shadow-sm dark:shadow-xl backdrop-blur-md overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <Logo size="lg" showBadge={false} />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-500/40 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>0G Bridge Buildathon &bull; Verifiable DeAI Swarm Protocol</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Verifiable Multi-Agent Swarms on 0G Storage & Compute
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            Single monolithic AI agents hallucinate, suffer from single-point-of-failure vulnerabilities, and cannot be trusted with autonomous on-chain execution. <strong>0G Quorum</strong> orchestrates decentralized multi-agent swarms with Byzantine Fault Tolerant (BFT) consensus, high-throughput 0G DA storage, and cryptographic Merkle proofs anchored to <strong>{currentNetwork.name}</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button onClick={() => onLaunchConsole("defi_liquidity_arbitrage")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-mono font-bold text-xs shadow-lg transition-all cursor-pointer">
              <span>Launch Swarm Console</span><ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onLaunchConsole("zero_day_exploit_intercept")} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-mono font-semibold text-xs transition-colors cursor-pointer">
              <Shield className="w-4 h-4 text-rose-500" /><span>Simulate Threat Defense (12M Flashloan)</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {["No Private Keys Exposed", "Hardware TEE Attestation", "50 GB/s 0G Storage DA"].map((label) => (
              <span key={label} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>{label}</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. METRICS BAR */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1"><span>0G Storage DA</span><Database className="w-4 h-4 text-teal-600 dark:text-teal-400" /></div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">50 GB/s</div><div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">Turbo Indexer Active</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1"><span>0G Compute</span><Cpu className="w-4 h-4 text-violet-600 dark:text-violet-400" /></div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">4 TEE Enclaves</div><div className="text-[11px] text-violet-600 dark:text-violet-400 mt-0.5">Llama-3.1-70B Isolated</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1"><span>Commit Latency</span><Zap className="w-4 h-4 text-amber-500" /></div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">24 ms</div><div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Sub-second consensus</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1"><span>EVM Settlement</span><Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /></div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">Chain #{currentNetwork.chainId}</div><div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">{currentNetwork.name}</div>
        </div>
      </section>

      {/* 3. PROBLEM VS SOLUTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-mono font-bold text-xs uppercase tracking-wider"><AlertTriangle className="w-4 h-4" /><span>The Single-Agent Failure Problem</span></div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Autonomous LLMs fail when given unverified authority</h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
            {PROBLEMS.map((p, i) => (<li key={i} className="flex items-start gap-2"><span className="text-rose-500 font-bold font-mono">&bull;</span><span>{p}</span></li>))}
          </ul>
        </div>
        <div className="p-6 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-3">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-mono font-bold text-xs uppercase tracking-wider"><ShieldCheck className="w-4 h-4" /><span>The 0G Quorum Swarm Solution</span></div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Decentralized adversarial consensus with 0G Storage</h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
            {SOLUTIONS.map((s, i) => (<li key={i} className="flex items-start gap-2"><span className="text-teal-500 font-bold font-mono">&bull;</span><span>{s}</span></li>))}
          </ul>
        </div>
      </section>

      {/* 4. PERSONAS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">The 0G Quorum Swarm Personas</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Four specialized agents operating concurrently in hardware-isolated TEE enclaves</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {PERSONAS.map((p) => (
            <div key={p.name} className={`p-4 rounded-xl bg-white dark:bg-[#0e1420] border ${p.border} space-y-2.5 shadow-xs`}>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2">{p.icon}<span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</span></div><span className={`text-[10px] px-1.5 py-0.5 rounded border ${p.badge}`}>{p.role}</span></div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{p.desc}</p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-white/[0.04]">{p.rule}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ARCHITECTURE */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-lg space-y-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">End-to-End System Architecture</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">How 0G Compute, 0G Storage DA, and {currentNetwork.name} coordinate in real time</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          {STEPS.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-[#090d15] border border-slate-200 dark:border-white/[0.06] space-y-2">
              <span className={`text-[10px] font-bold block ${s.color}`}>{s.step}</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">{s.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CTA */}
      <section className="rounded-2xl p-8 border border-teal-300 dark:border-teal-500/40 bg-teal-50/70 dark:bg-teal-950/30 text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">Ready to test real-time multi-agent consensus?</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">Launch pre-configured DeFi arbitrage, zero-day threat defense, or DAO escrow scenarios on {currentNetwork.name}, or inject a Byzantine rogue persona to test automated isolation.</p>
        <div className="pt-2 flex justify-center gap-3">
          <button onClick={() => onLaunchConsole("defi_liquidity_arbitrage")} className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2">
            <span>Open Mission Control</span><ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
