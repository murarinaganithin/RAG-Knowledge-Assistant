import React, { useState } from 'react';
import { X, Cloud, Server, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Zap, Shield, ArrowRight } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, testBackendConnection } from '../services/api';

export default function BackendConnectModal({ isOpen, onClose, onConnectionChanged, currentStatus }) {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl() === '/api' ? '' : getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testBackendConnection(apiUrl || '/api');
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    setApiBaseUrl(apiUrl);
    if (onConnectionChanged) onConnectionChanged();
    onClose();
  };

  const handleResetToBrowser = () => {
    setApiBaseUrl('');
    setApiUrl('');
    setTestResult(null);
    if (onConnectionChanged) onConnectionChanged();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Cloud Backend API Connection</h3>
              <p className="text-[11px] text-slate-400">Connect to your live Python FastAPI + LangChain server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Active Mode Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            currentStatus?.online
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${currentStatus?.online ? 'bg-emerald-400' : 'bg-indigo-400'} animate-pulse`}></span>
              <span>Active Engine: <strong>{currentStatus?.online ? 'Live Python FastAPI' : 'In-Browser Hybrid RAG'}</strong></span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300">
              {currentStatus?.url || 'In-Browser'}
            </span>
          </div>

          {/* 1-Click Cloud Deploy Options */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Deploy Your Free FastAPI Server (2-3 Minutes):
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Render */}
              <a
                href="https://render.com/deploy?repo=https://github.com/murarinaganithin/RAG-Knowledge-Assistant"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    R
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Deploy on Render</h4>
                    <p className="text-[10px] text-slate-400">Uses render.yaml blueprint</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </a>

              {/* Hugging Face Spaces */}
              <a
                href="https://huggingface.co/new-space?template=https://github.com/murarinaganithin/RAG-Knowledge-Assistant"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    HF
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Hugging Face Space</h4>
                    <p className="text-[10px] text-slate-400">Free 16GB RAM Docker</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Connect URL Form */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block">
              Enter Your Cloud Backend URL:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://rag-knowledge-assistant-api.onrender.com"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={handleTest}
                disabled={testing}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{testing ? 'Testing...' : 'Test'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-0.5 font-mono text-[11px]">
                  <div>{testResult.success ? '✅ Backend Connected Successfully!' : `❌ Connection failed: ${testResult.error}`}</div>
                  {testResult.success && (
                    <div className="text-slate-400">
                      Latency: {testResult.latency}ms • LangChain: {testResult.data?.langchain_version} • Docs: {testResult.data?.indexed_documents}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0">
          <button
            onClick={handleResetToBrowser}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Use In-Browser Engine
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Save & Connect
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
