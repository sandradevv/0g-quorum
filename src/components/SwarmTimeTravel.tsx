"use client";

import React, { useState, useEffect } from "react";
import { History, Play, Pause, ChevronLeft, ChevronRight, Hash, Clock, Cpu, RotateCcw } from "@/components/Icons";
import { AgentDebateTurn } from "@/lib/types";

export const SwarmTimeTravel: React.FC<{ turns: AgentDebateTurn[] }> = ({ turns }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  useEffect(() => {
    if (!isPlaying || turns.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= turns.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1600 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, turns.length, playbackSpeed]);

  if (turns.length === 0) return null;
  const currentTurn = turns[currentIndex] || turns[0];

  return (
    <div className="bg-white dark:bg-[#0e1420] border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm dark:shadow-lg space-y-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Swarm Deliberation Time-Travel Replayer</h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#090d15] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.06]">
            {[1, 2].map((spd) => (
              <button key={spd} onClick={() => setPlaybackSpeed(spd)} className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${playbackSpeed === spd ? "bg-teal-600 text-white dark:text-slate-950" : "text-slate-500 dark:text-slate-400"}`}>
                {spd}x
              </button>
            ))}
          </div>
          <span className="text-slate-500 dark:text-slate-400">Turn <strong className="text-teal-700 dark:text-teal-300 tabular-nums">{currentIndex + 1}</strong> of <span className="tabular-nums">{turns.length}</span> (Round {currentTurn.round})</span>
        </div>
      </div>

      <div className="space-y-3">
        <input type="range" min="0" max={turns.length - 1} value={currentIndex} onChange={(e) => { setCurrentIndex(Number(e.target.value)); setIsPlaying(false); }} className="w-full accent-teal-600 dark:accent-teal-500 bg-slate-200 dark:bg-slate-800 cursor-pointer h-2 rounded-lg" />
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[10px] font-mono text-center">
          {turns.map((t, idx) => (
            <button key={t.id} onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }} className={`p-1 rounded truncate border cursor-pointer transition-colors ${idx === currentIndex ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-400 dark:border-teal-500 font-bold" : "bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.04] hover:bg-slate-200 dark:hover:bg-slate-800"}`}>
              R{t.round}: {t.agentName.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <button onClick={() => { setCurrentIndex((p) => Math.max(0, p - 1)); setIsPlaying(false); }} disabled={currentIndex === 0} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-600/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40 hover:bg-teal-200 dark:hover:bg-teal-600/30 font-semibold cursor-pointer">
              {isPlaying ? <><Pause className="w-3.5 h-3.5" /><span>Pause</span></> : <><Play className="w-3.5 h-3.5 fill-current" /><span>Play Replay</span></>}
            </button>
            <button onClick={() => { setCurrentIndex((p) => Math.min(turns.length - 1, p + 1)); setIsPlaying(false); }} disabled={currentIndex >= turns.length - 1} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-200" /></button>
            <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer" title="Reset"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /><span>{currentTurn.timestamp.split("T")[1]?.slice(0, 8)}</span></span>
            <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-slate-400" /><span className="tabular-nums">{currentTurn.reasoningTokens} tokens</span></span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090d15] border border-slate-200 dark:border-white/[0.06] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{currentTurn.agentName}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300">{currentTurn.role}</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Type: {currentTurn.messageType}</span>
          </div>
          {currentTurn.vote && (
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${currentTurn.vote.decision === "APPROVE" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800" : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800"}`}>
              VOTE: {currentTurn.vote.decision} ({currentTurn.vote.confidence}%)
            </span>
          )}
        </div>
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-white dark:bg-[#0c121e] p-3.5 rounded-lg border border-slate-200 dark:border-white/[0.04]">{currentTurn.statement}</p>
        <div className="space-y-1.5 text-xs font-mono">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Enclave Context State Snapshot</span>
          <pre className="p-3 rounded-lg bg-slate-900 dark:bg-[#06090e] text-[11px] text-teal-300 overflow-x-auto border border-slate-800 dark:border-white/[0.04] leading-relaxed">{JSON.stringify(currentTurn.dataPoints, null, 2)}</pre>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/[0.04]">
          <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Leaf Hash: {currentTurn.leafHash}</span>
        </div>
      </div>
    </div>
  );
};
