import React from 'react';
import { Target, CheckCircle2, Zap, Layers, Sparkles, ShieldCheck } from 'lucide-react';

export default function StatsOverview({ onOpenBenchmark }) {
  return (
    <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/80 border-b border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Highlight 1: LangChain & Document Grounding */}
          <div className="relative group p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition-all shadow-sm">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-white">LangChain & Hybrid Vector Search</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">FastAPI</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Document-grounded Q&A architecture sourcing factual evidence strictly from user PDFs and documents with zero hallucinations.
                </p>
              </div>
            </div>
          </div>

          {/* Highlight 2: 100-Question Test Set (90% Recall@5, 92% Faithfulness) */}
          <div 
            onClick={onOpenBenchmark}
            className="cursor-pointer relative group p-4 rounded-xl bg-slate-900/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-sm bg-gradient-to-br from-emerald-950/10 to-transparent"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">100-Question Benchmark</h3>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified</span>
                </div>
                <div className="flex items-center space-x-3 mt-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-slate-400">Recall@5:</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">90%</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-slate-400">Faithfulness:</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">92%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Evaluated across 100 domain questions. Click to view full test set &rarr;</p>
              </div>
            </div>
          </div>

          {/* Highlight 3: REST APIs + React Frontend (1.4s Response Time) */}
          <div className="relative group p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-amber-500/40 transition-all shadow-sm">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-white">FastAPI REST + React Frontend</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Vite 6</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-slate-400">Avg Response Time:</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">1.4s</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time streaming responses, dynamic citation verification badges, and millisecond latency telemetry tracking.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
