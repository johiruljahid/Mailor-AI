import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { chunkText, retrieveRelevantKnowledge } from '../../lib/knowledgeRetrieval';
import { KnowledgeCategory, KnowledgeItem } from '../../types';
import { GoogleDriveModal } from './GoogleDriveModal';
import { GoogleDriveService } from '../../services/googleDriveService';
import {
  Database,
  UploadCloud,
  Plus,
  Search,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  HardDrive,
  RefreshCw,
  FolderSync,
  FileSpreadsheet,
  Link as LinkIcon,
} from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const {
    knowledge,
    addKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    toggleKnowledgeItem,
    importGoogleDoc,
    createGoogleDocKnowledge,
    googleSheetsConfig,
    connectGoogleSheet,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resyncingId, setResyncingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);
  const [docUrlInput, setDocUrlInput] = useState('');
  const [isImportingDoc, setIsImportingDoc] = useState(false);
  const [showDocImportInput, setShowDocImportInput] = useState(false);

  // New item form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('FAQ');
  const [content, setContent] = useState('');

  const categories: KnowledgeCategory[] = [
    'Company Information',
    'Products',
    'Services',
    'Pricing',
    'FAQ',
    'Refund Policy',
    'Shipping Policy',
    'Opening Hours',
    'Contact Information',
    'Custom',
  ];

  // Search results
  const searchResults = searchQuery.trim()
    ? retrieveRelevantKnowledge(searchQuery, knowledge, 5, 0.05)
    : [];

  const filteredKnowledge = knowledge.filter(k => {
    const matchesCategory = selectedCategory === 'ALL' || k.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    addKnowledgeItem({
      title,
      category,
      content,
      status: 'READY',
      isEnabled: true,
      sourceFileName: 'Manual Entry',
      sourceFileType: 'TEXT',
      sourceFileSize: `${Math.round((content.length / 1024) * 10) / 10} KB`,
    });

    setTitle('');
    setContent('');
    setIsAddModalOpen(false);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

      addKnowledgeItem({
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        category: 'Company Information',
        content: text || `Uploaded document content for ${file.name}`,
        status: 'READY',
        isEnabled: true,
        sourceFileName: file.name,
        sourceFileType: ext,
        sourceFileSize: `${Math.round(file.size / 1024 || 1)} KB`,
      });

      addToast({
        type: 'success',
        title: 'Document Uploaded & Parsed ✓',
        message: `"${file.name}" added to active knowledge base.`,
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      setIsUploading(false);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not read file contents.',
      });
    };

    reader.readAsText(file);
  };

  const handleResyncFromDrive = async (item: KnowledgeItem) => {
    if (!item.sourceDriveFileId) return;
    setResyncingId(item.id);
    try {
      const freshContent = await GoogleDriveService.getFileContent(
        item.sourceDriveFileId,
        'application/vnd.google-apps.document'
      );
      updateKnowledgeItem(item.id, {
        content: freshContent,
        lastDriveSyncAt: new Date().toISOString(),
      });
      addToast({
        type: 'success',
        title: 'Re-synced with Google Drive ✓',
        message: `Updated "${item.title}" with latest version from Google Drive.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Re-sync failed',
        message: err.message || 'Could not fetch latest document from Google Drive.',
      });
    } finally {
      setResyncingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Business Knowledge</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {knowledge.length} Documents
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Import from Google Drive or upload PDFs, spreadsheets, and policies. Mailora chunks this knowledge and uses it to answer your customers accurately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Google Docs Import Button */}
          <button
            onClick={() => setShowDocImportInput(!showDocImportInput)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Google Docs</span>
          </button>

          {/* Google Drive Import Button */}
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <HardDrive className="w-4 h-4 text-slate-900" />
            <span>Google Drive</span>
          </button>

          {/* Google Sheets Live Link */}
          {googleSheetsConfig.isConnected && googleSheetsConfig.spreadsheetUrl ? (
            <a
              href={googleSheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Google Sheets ↗</span>
            </a>
          ) : (
            <button
              onClick={() => connectGoogleSheet()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Link Sheets</span>
            </button>
          )}

          {/* File Upload Button */}
          <label className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <span>{isUploading ? 'Indexing...' : 'Upload File'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.csv,.xlsx"
              onChange={handleSimulatedFileUpload}
              className="hidden"
            />
          </label>

          {/* Add Knowledge Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Google Docs Quick Import Dropdown Bar */}
      {showDocImportInput && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-slate-900 to-indigo-500/15 border border-sky-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white">Import Knowledge Directly from Google Docs</h3>
            </div>
            <button
              onClick={() => setShowDocImportInput(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={docUrlInput}
              onChange={e => setDocUrlInput(e.target.value)}
              placeholder="Paste Google Doc URL or Document ID (e.g. https://docs.google.com/document/d/...)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={async () => {
                if (!docUrlInput) return;
                setIsImportingDoc(true);
                await importGoogleDoc(docUrlInput);
                setIsImportingDoc(false);
                setDocUrlInput('');
                setShowDocImportInput(false);
              }}
              disabled={isImportingDoc}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isImportingDoc ? 'Fetching Doc...' : 'Import & Index Doc'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Mailora extracts text from your Google Doc and uses it as grounded reference knowledge for AI email replies.
          </p>
        </div>
      )}

      {/* Google Drive Connected Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white">Google Drive Integration Active</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Import Google Docs, Sheets, and PDFs directly into your AI Knowledge Base. Whenever docs change, re-sync with a single click.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDriveModalOpen(true)}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-all"
        >
          <FolderSync className="w-3.5 h-3.5" />
          <span>Browse Drive Files</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search business knowledge (e.g. 'refund', 'starter package', 'hours')..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Search Chunk Inspection Result */}
      {searchQuery.trim() && searchResults.length > 0 && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>RAG Semantic Retrieval Match for "{searchQuery}":</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {searchResults.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center justify-between font-semibold text-white mb-1">
                  <span>{r.title}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Score: {Math.round(r.score * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">{r.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Documents Grid */}
      {filteredKnowledge.length === 0 ? (
        <div className="py-16 text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm max-w-md mx-auto">
          <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No knowledge items found</h3>
          <p className="text-xs text-slate-400 mb-4">
            Import documents from Google Drive or add manual FAQs to teach your AI employee.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow"
            >
              Import from Drive
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow"
            >
              Add First Entry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKnowledge.map(item => {
            const isFromDrive = item.sourceFileType === 'GOOGLE_DRIVE' || Boolean(item.sourceDriveFileId);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                  item.isEnabled ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          isFromDrive
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {isFromDrive ? <HardDrive className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white leading-tight block">
                          {item.title}
                        </span>
                        {isFromDrive && (
                          <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1 mt-0.5">
                            Google Drive Document
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 shrink-0">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {item.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{item.sourceFileType || 'TXT'}</span>
                    <span>•</span>
                    <span>{item.sourceFileSize || '12 KB'}</span>
                    {item.lastDriveSyncAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 text-[10px]">Drive Synced</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isFromDrive && item.sourceDriveFileId && (
                      <button
                        onClick={() => handleResyncFromDrive(item)}
                        disabled={resyncingId === item.id}
                        className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Re-sync from Google Drive"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${resyncingId === item.id ? 'animate-spin text-amber-400' : ''}`} />
                      </button>
                    )}

                    <button
                      onClick={() => setViewingItem(item)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                      title="View full content"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleKnowledgeItem(item.id)}
                      className={`p-1.5 transition-colors ${
                        item.isEnabled ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                      title={item.isEnabled ? 'Enabled for AI' : 'Disabled'}
                    >
                      {item.isEnabled ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteKnowledgeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Knowledge Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Add Knowledge Entry</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKnowledge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title / Subject
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Standard Website Delivery Timeline"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as KnowledgeCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content / Instructions
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste policies, answers, package details, or company guidelines..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Save & Index Knowledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Item Drawer / Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {viewingItem.category}
                  </span>
                  {viewingItem.sourceFileType === 'GOOGLE_DRIVE' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Google Drive
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-1">{viewingItem.title}</h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
              {viewingItem.content}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4 text-xs text-slate-400">
              <span>Source: {viewingItem.sourceFileName || 'Direct text'}</span>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </div>
  );
};
