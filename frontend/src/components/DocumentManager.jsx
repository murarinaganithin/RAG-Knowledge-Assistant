import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Database, CheckCircle, RefreshCw, AlertCircle, File, Trash2, CheckCircle2 } from 'lucide-react';
import { fetchDocuments, uploadDocument, deleteDocument } from '../services/api';

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
    setUploadStatus({ type: 'info', message: `Processing and chunking "${file.name}"...` });
    try {
      const res = await uploadDocument(file);
      setUploadStatus({ 
        type: 'success', 
        message: res.message || `Successfully uploaded and indexed "${file.name}"!` 
      });
      await loadDocs();
    } catch (err) {
      setUploadStatus({ 
        type: 'error', 
        message: `Failed to upload: ${err.message || 'Unknown error'}` 
      });
    } finally {
      setUploading(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleDelete = async (filename) => {
    await deleteDocument(filename);
    await loadDocs();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Document Knowledge Base</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Ingest, parse, and chunk documents using LangChain recursive character text splitters for grounded vector search.
        </p>
      </div>

      {/* Upload Box */}
      <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 transition-all text-center">
        <div className="max-w-md mx-auto space-y-3.5">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Upload your knowledge documents</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports <strong>PDF</strong>, Plain Text (.txt), and Markdown (.md). Documents are semantically chunked and indexed into the vector store.
            </p>
          </div>
          <div>
            <label className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/20 transition-colors">
              <span>{uploading ? 'Chunking & Indexing...' : 'Select PDF or Document to Upload'}</span>
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
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-center space-x-2 ${
              uploadStatus.type === 'success' 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                : uploadStatus.type === 'info'
                ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}>
              {uploadStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {uploadStatus.type === 'info' && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
              {uploadStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{uploadStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Active Knowledge Documents ({docs.length})</span>
          </h3>
          <button
            onClick={loadDocs}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                doc.category === 'User Upload'
                  ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm shadow-indigo-500/5'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      doc.category === 'User Upload' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-indigo-400'
                    }`}>
                      <File className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">{doc.filename}</h4>
                      <span className="text-[10px] font-medium text-slate-400">{doc.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      doc.category === 'User Upload'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {doc.category === 'User Upload' ? 'User Upload' : 'Sample'}
                    </span>
                    {doc.category === 'User Upload' && (
                      <button
                        onClick={() => handleDelete(doc.filename)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove uploaded document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {doc.title && (
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {doc.title}
                  </p>
                )}
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{doc.char_count?.toLocaleString()} chars</span>
                <span className="text-indigo-400 font-sans text-xs">
                  {doc.chunks_count ? `${doc.chunks_count} Chunks` : 'LangChain Chunked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
