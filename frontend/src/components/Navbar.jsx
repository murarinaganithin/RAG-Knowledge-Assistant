import React from 'react';
import { BookOpen, BarChart3, Database, MessageSquare, Cloud, Server, Activity } from 'lucide-react';

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Navbar({ activeTab, setActiveTab, onOpenConnectModal, backendStatus }) {
  const tabs = [
    { id: 'chat', label: 'Q&A Assistant', icon: MessageSquare },
    { id: 'documents', label: 'Knowledge Base', icon: Database },
    { id: 'benchmark', label: '100-Q Benchmark', icon: BarChart3, badge: '90% / 92%' },
    { id: 'architecture', label: 'Architecture', icon: BookOpen },
  ];

  const isOnline = backendStatus?.online;

  return (
    <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 py-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">RAG Knowledge Assistant</h1>
                <span className="hidden xs:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  LangChain v0.3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Document-Grounded Q&A • Vector Search • Evaluated RAG</p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-900/90 text-emerald-300' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & GitHub Link */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Cloud Backend Pill (Clickable) */}
            <button
              onClick={onOpenConnectModal}
              title="Click to configure Cloud Backend (Render / Hugging Face)"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-all cursor-pointer ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/40 text-slate-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
              <Cloud className="w-3 h-3 text-indigo-400" />
              <span>{isOnline ? 'Cloud API' : 'Connect Cloud'}</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Latency:</span>
              <span className="font-semibold text-emerald-400 font-mono">1.4s</span>
            </div>

            <a
              href="https://github.com/murarinaganithin/RAG-Knowledge-Assistant"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors shrink-0"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-900 gap-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-bold px-1 rounded-full bg-emerald-500/20 text-emerald-400">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
