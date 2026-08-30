"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, XCircle, X } from "@/components/Icons";

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  description?: string;
}

const STYLES = {
  success: { border: "border-emerald-500/40 bg-[#0d1814]/95 text-emerald-200", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> },
  warning: { border: "border-amber-500/40 bg-[#19150a]/95 text-amber-200", icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" /> },
  error: { border: "border-rose-500/40 bg-[#1a0c10]/95 text-rose-200", icon: <XCircle className="w-4 h-4 text-rose-400 shrink-0" /> },
  info: { border: "border-teal-500/40 bg-[#091518]/95 text-teal-200", icon: <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> },
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    {toasts.map((toast) => (
      <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
    ))}
  </div>
);

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const style = STYLES[toast.type] || STYLES.info;

  return (
    <div className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start justify-between gap-3 transition-all duration-300 ${style.border}`}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">{style.icon}</div>
        <div>
          <div className="text-xs font-semibold text-slate-100">{toast.title}</div>
          {toast.description && <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-mono">{toast.description}</div>}
        </div>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
