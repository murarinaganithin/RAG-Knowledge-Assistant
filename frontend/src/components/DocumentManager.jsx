import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Database, CheckCircle, RefreshCw, AlertCircle, File, Layers } from 'lucide-react';
import { fetchDocuments, uploadDocument } from '../services/api';

export default function DocumentManager() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    const data = await fetchDocuments();
    setDocs(data.documents || []);
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      await uploadDocument(file);
      setUploadStatus({ type: 'success', message: `Uploaded and indexed "${file.name}"` });
      await loadDocs();
    } catch (err) {
      setUploadStatus({ type: 'error', message: `Failed to upload: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Document Knowledge Base</h2>
        <p className="text-sm text-slate-400 mt-1">
          Ingest, chunk, and index documents using LangChain loaders and recursive text splitters for grounded vector search.
        </p>
      </div>

      {/* Upload Box */}
      <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 transition-all text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Upload your knowledge documents</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, Plain Text (.txt), and Markdown (.md). Documents are parsed and split into semantic chunks.
            </p>
          </div>
          <div>
            <label className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/20 transition-colors">
              <span>{uploading ? 'Processing & Indexing...' : 'Select File to Upload'}</span>
              <input
                type="file"
                accept=".pdf,.txt,.md,.csv,.json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploadStatus && (
            <p className={`text-xs ${uploadStatus.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {uploadStatus.message}
            </p>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Indexed Knowledge Documents ({docs.length})</span>
          </h3>
          <button
            onClick={loadDocs}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                      <File className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">{doc.filename}</h4>
                      <span className="text-[10px] font-medium text-slate-400">{doc.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Indexed
                  </span>
                </div>
                {doc.title && (
                  <p className="text-xs text-slate-300 mt-2.5 line-clamp-2">
                    {doc.title}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{doc.char_count?.toLocaleString()} chars</span>
                <span className="text-indigo-400 font-sans text-xs">LangChain Chunked</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
