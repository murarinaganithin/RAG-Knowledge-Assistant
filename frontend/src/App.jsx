import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import EvaluationDashboard from './components/EvaluationDashboard';
import ArchitectureView from './components/ArchitectureView';
import SourceViewerModal from './components/SourceViewerModal';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    checkBackendHealth().then((status) => setBackendStatus(status));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

      {/* Flagship Highlights Overview Banner */}
      <StatsOverview onOpenBenchmark={() => setActiveTab('benchmark')} />

      {/* Main Tab Content */}
      <main className="flex-1 pb-12">
        {activeTab === 'chat' && (
          <ChatInterface onInspectCitation={(citation) => setSelectedCitation(citation)} />
        )}
        {activeTab === 'documents' && <DocumentManager />}
        {activeTab === 'benchmark' && (
          <EvaluationDashboard onInspectCitation={(citation) => setSelectedCitation(citation)} />
        )}
        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Source Citation Inspector Modal */}
      {selectedCitation && (
        <SourceViewerModal
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        RAG Knowledge Assistant • Built with LangChain & FastAPI • 90% Recall@5 • 92% Faithfulness • 1.4s Latency
      </footer>
    </div>
  );
}
