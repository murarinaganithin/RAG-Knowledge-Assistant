import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import EvaluationDashboard from './components/EvaluationDashboard';
import ArchitectureView from './components/ArchitectureView';
import SourceViewerModal from './components/SourceViewerModal';
import BackendConnectModal from './components/BackendConnectModal';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  const refreshStatus = () => {
    checkBackendHealth().then((status) => setBackendStatus(status));
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Responsive Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        backendStatus={backendStatus}
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeTab === 'chat' && (
          <ChatInterface 
            onInspectCitation={(citation) => setSelectedCitation(citation)} 
            onOpenBenchmark={() => setActiveTab('benchmark')}
          />
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

      {/* Cloud Backend Connect Modal */}
      <BackendConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectionChanged={refreshStatus}
        currentStatus={backendStatus}
      />
    </div>
  );
}
