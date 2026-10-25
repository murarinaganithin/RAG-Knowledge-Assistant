import React from 'react';
import { X, FileText, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';

export default function SourceViewerModal({ citation, onClose }) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">{citation.filename}</h3>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                <span>Page {citation.page}</span>
                <span>•</span>
                <span className="font-mono text-indigo-400">Chunk {citation.chunk_id}</span>
                {citation.score && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono font-medium">Relevance: {(citation.score * 100).toFixed(1)}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-indigo-600/40">
            {citation.full_text || citation.snippet}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Verifiable ground truth extracted via LangChain Hybrid Vector Retriever.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Source Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
