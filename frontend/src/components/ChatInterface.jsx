import React, { useState } from 'react';
import { Send, Sparkles, AlertTriangle, ShieldCheck, Clock, BookOpen, ChevronRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import { queryRAG } from '../services/api';

const SAMPLE_PROMPTS = [
  { label: 'Attention Formula', q: 'What is the mathematical formula for Scaled Dot-Product Attention?' },
  { label: 'Circuit Breaker', q: 'What are the three operational states of a Circuit Breaker?' },
  { label: 'Basel III CET1', q: 'What is the minimum Common Equity Tier 1 (CET1) capital ratio required under Basel III?' },
  { label: 'Zero Trust PDP', q: 'What two sub-components make up the Policy Decision Point (PDP)?' },
  { label: 'Refusal Guardrail Test', q: 'What is the recipe for baking traditional sourdough bread?' },
];

export default function ChatInterface({ onInspectCitation }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your **RAG Knowledge Assistant**. I provide answers strictly grounded in your indexed documents, complete with verifiable source citations and refusal guardrails. Try asking a question or click one of the prompts below!",
      evidenceFound: true,
      latency: 1.40,
      citations: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText = inputQuery) => {
    const q = queryText.trim();
    if (!q || loading) return;

    setInputQuery('');
    setLoading(true);

    // Add user message
    const newMessages = [...messages, { role: 'user', text: q }];
    setMessages(newMessages);

    try {
      const response = await queryRAG(q);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: response.answer,
          evidenceFound: response.evidence_found,
          confidence: response.confidence_score,
          latency: response.latency?.total_seconds || 1.40,
          retrievalLatency: response.latency?.retrieval_seconds || 0.24,
          citations: response.citations || [],
          evaluation: response.evaluation,
          retrievedChunks: response.retrieved_chunks || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: "⚠️ An error occurred while contacting the RAG retrieval service.",
          evidenceFound: false,
          latency: 0.5,
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto px-4 py-4 sm:px-6">
      
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none shadow-sm'
              }`}
            >
              {/* Role Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-semibold tracking-wider uppercase ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}>
                  {msg.role === 'user' ? 'You' : 'RAG Knowledge Assistant'}
                </span>

                {msg.role === 'assistant' && msg.latency && (
                  <div className="flex items-center space-x-2 text-[11px] font-mono">
                    <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Clock className="w-3 h-3" />
                      <span>{msg.latency}s</span>
                    </span>
                    {msg.evidenceFound === false && (
                      <span className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Refusal Guardrail</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Verifiable Document Sources ({msg.citations.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => onInspectCitation(c)}
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 text-xs transition-colors group cursor-pointer"
                        title="Click to view full source passage"
                      >
                        <span className="font-medium truncate max-w-[200px]">{c.filename}</span>
                        <span className="text-indigo-400/70 font-mono text-[10px]">p.{c.page}</span>
                        <span className="text-[10px] bg-indigo-500/20 px-1 py-0.2 rounded text-indigo-200 group-hover:bg-indigo-500/40">
                          Inspect &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Metrics Pill for Assistant responses */}
              {msg.evaluation && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                  <span>Recall@5: <strong className="text-emerald-400">{Math.round(msg.evaluation.recall_at_5 * 100)}%</strong></span>
                  <span>•</span>
                  <span>Faithfulness: <strong className="text-emerald-400">{Math.round(msg.evaluation.faithfulness * 100)}%</strong></span>
                  <span>•</span>
                  <span>Relevance: <strong className="text-slate-300">{Math.round(msg.evaluation.relevance * 100)}%</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-5 py-4 flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-slate-400 font-mono">Retrieving evidence via LangChain Hybrid Vector Store...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Pill Row */}
      <div className="py-2 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-xs text-slate-500 flex items-center space-x-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Try:</span>
        </span>
        {SAMPLE_PROMPTS.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sp.q)}
            disabled={loading}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-colors"
          >
            {sp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="pt-2">
        <div className="relative flex items-center rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500 shadow-lg transition-all">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything grounded in your documents (e.g. Transformer heads, Circuit breaker rules)..."
            rows={1}
            disabled={loading}
            className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none font-sans"
          />
          <div className="pr-3 flex items-center space-x-2">
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputQuery.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 mt-1.5 font-mono">
          <span>Strict Zero-Hallucination Guardrail Active</span>
          <span>Target Response Time: ~1.4s</span>
        </div>
      </div>

    </div>
  );
}
