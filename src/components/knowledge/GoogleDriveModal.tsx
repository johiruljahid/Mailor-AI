import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleDriveService } from '../../services/googleDriveService';
import { GoogleDriveFile, KnowledgeCategory } from '../../types';
import {
  FileText,
  Search,
  HardDrive,
  CheckCircle2,
  DownloadCloud,
  ExternalLink,
  X,
  Sparkles,
  RefreshCw,
  FolderSync,
  UploadCloud,
  FileCheck,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose }) => {
  const {
    knowledge,
    addKnowledgeItem,
    addToast,
    user,
    gmailAccount,
    isGoogleAuthenticated,
    connectGoogleAccount,
  } = useApp();

  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [targetCategory, setTargetCategory] = useState<KnowledgeCategory>('Company Information');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isExportingBackup, setIsExportingBackup] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');

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

  // Load Google Drive files
  const loadDriveFiles = async (query?: string) => {
    setIsLoading(true);
    try {
      const driveFiles = await GoogleDriveService.listFiles({ query });
      setFiles(driveFiles);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Google Drive error',
        message: err.message || 'Could not load files from Google Drive.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectAndLoad = async () => {
    setIsConnectingGoogle(true);
    try {
      await connectGoogleAccount();
      await loadDriveFiles();
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDriveFiles();
      setSelectedFile(null);
      setPreviewContent('');
    }
  }, [isOpen]);

  // When user selects a file to preview
  const handleSelectFile = async (file: GoogleDriveFile) => {
    setSelectedFile(file);
    setIsLoadingContent(true);

    // Auto-detect category based on filename
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('pricing') || lowerName.includes('package') || lowerName.includes('cost')) {
      setTargetCategory('Pricing');
    } else if (lowerName.includes('refund') || lowerName.includes('guarantee') || lowerName.includes('return')) {
      setTargetCategory('Refund Policy');
    } else if (lowerName.includes('faq') || lowerName.includes('question') || lowerName.includes('help')) {
      setTargetCategory('FAQ');
    } else if (lowerName.includes('service') || lowerName.includes('solution') || lowerName.includes('development')) {
      setTargetCategory('Services');
    } else if (lowerName.includes('product') || lowerName.includes('catalog')) {
      setTargetCategory('Products');
    } else if (lowerName.includes('shipping') || lowerName.includes('delivery')) {
      setTargetCategory('Shipping Policy');
    } else if (lowerName.includes('hour') || lowerName.includes('contact') || lowerName.includes('support')) {
      setTargetCategory('Opening Hours');
    } else {
      setTargetCategory('Company Information');
    }

    try {
      const content = await GoogleDriveService.getFileContent(file.id, file.mimeType);
      setPreviewContent(content);
    } catch (err) {
      setPreviewContent('Preview unavailable for this file format.');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Import into knowledge base
  const handleImport = async () => {
    if (!selectedFile || !previewContent) return;

    setIsImporting(true);
    try {
      addKnowledgeItem({
        title: selectedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        category: targetCategory,
        content: previewContent,
        status: 'READY',
        isEnabled: true,
        sourceFileName: selectedFile.name,
        sourceFileType: 'GOOGLE_DRIVE',
        sourceFileSize: typeof selectedFile.size === 'string' ? selectedFile.size : 'Drive Doc',
        sourceDriveFileId: selectedFile.id,
        sourceDriveLink: selectedFile.webViewLink,
        lastDriveSyncAt: new Date().toISOString(),
      });

      addToast({
        type: 'success',
        title: 'Imported from Google Drive ✓',
        message: `"${selectedFile.name}" successfully indexed into Mailora AI Knowledge Base.`,
      });

      setSelectedFile(null);
      setPreviewContent('');
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: err.message || 'Could not import document from Google Drive.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Backup knowledge to Google Drive
  const handleBackupToDrive = async () => {
    setIsExportingBackup(true);
    try {
      const backupText = knowledge
        .map(
          k =>
            `========================================\nDOCUMENT: ${k.title}\nCATEGORY: ${k.category}\nUPDATED: ${k.updatedAt}\n========================================\n\n${k.content}\n\n`
        )
        .join('\n');

      const fileName = `Mailora_AI_Knowledge_Backup_${new Date().toISOString().slice(0, 10)}.txt`;
      const result = await GoogleDriveService.exportBackupToDrive(fileName, backupText, 'text/plain');

      addToast({
        type: 'success',
        title: 'Knowledge Base Backed Up to Drive ✓',
        message: `Saved as "${fileName}" in your Google Drive workspace.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Backup Failed',
        message: err.message || 'Could not save backup to Google Drive.',
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = files.filter(f => {
    const matchesSearch = !searchQuery.trim() || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'DOCS' && f.mimeType.includes('document')) ||
      (filterType === 'PDF' && f.mimeType.includes('pdf')) ||
      (filterType === 'SHEETS' && f.mimeType.includes('spreadsheet'));
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Google Drive Integration</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> OAuth Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected Account: <span className="text-slate-300 font-medium">{gmailAccount?.email || user?.email || 'johirul4856@gmail.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupToDrive}
              disabled={isExportingBackup}
              title="Backup current knowledge base to Google Drive"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
              <span>{isExportingBackup ? 'Backing up...' : 'Backup KB to Drive'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        {!isGoogleAuthenticated && (
          <div className="p-3.5 bg-amber-500/15 border-b border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Google Drive not yet authorized for this session. Connect your Google account to browse and sync files.</span>
            </div>
            <button
              onClick={handleConnectAndLoad}
              disabled={isConnectingGoogle}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isConnectingGoogle ? 'animate-spin' : ''}`} />
              <span>{isConnectingGoogle ? 'Connecting...' : '🔑 Connect Google Drive Now'}</span>
            </button>
          </div>
        )}

        <div className="p-4 border-b border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files in Google Drive..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-[11px] font-medium">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'ALL' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All Files
              </button>
              <button
                onClick={() => setFilterType('DOCS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'DOCS' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Docs
              </button>
              <button
                onClick={() => setFilterType('PDF')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'PDF' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                PDFs
              </button>
              <button
                onClick={() => setFilterType('SHEETS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'SHEETS' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Sheets
              </button>
            </div>

            <button
              onClick={() => loadDriveFiles(searchQuery)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Refresh Google Drive files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body: Split view (File List + Preview & Import panel) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[420px] overflow-hidden">
          {/* File list */}
          <div className="md:col-span-6 border-r border-slate-800 overflow-y-auto max-h-[500px] p-3 space-y-2">
            {isLoading ? (
              <div className="py-20 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
                <p className="text-xs">Fetching Google Drive documents...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs">No matching files found in your Google Drive.</p>
              </div>
            ) : (
              filteredFiles.map(file => {
                const isSelected = selectedFile?.id === file.id;
                const isAlreadyIndexed = knowledge.some(k => k.sourceDriveFileId === file.id || k.sourceFileName === file.name);

                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        {file.mimeType.includes('pdf') ? (
                          <FileText className="w-4 h-4 text-rose-400" />
                        ) : file.mimeType.includes('spreadsheet') ? (
                          <Layers className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate">{file.name}</h4>
                          {isAlreadyIndexed && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-400 shrink-0">
                              Synced
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {file.size} • Modified {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
                  </div>
                );
              })
            )}
          </div>

          {/* Preview & Import panel */}
          <div className="md:col-span-6 p-4 flex flex-col justify-between overflow-y-auto max-h-[500px] bg-slate-950/30">
            {selectedFile ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Document Selected
                      </span>
                      <h3 className="text-sm font-bold text-white truncate max-w-[280px]">
                        {selectedFile.name}
                      </h3>
                    </div>
                    {selectedFile.webViewLink && (
                      <a
                        href={selectedFile.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <span>Open in Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Target Knowledge Category */}
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Assign Knowledge Category
                    </label>
                    <select
                      value={targetCategory}
                      onChange={e => setTargetCategory(e.target.value as KnowledgeCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Mailora AI uses this category to answer matching customer queries automatically.
                    </p>
                  </div>

                  {/* Document preview */}
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Content Preview ({previewContent.length} chars)
                    </label>
                    <div className="h-44 overflow-y-auto p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {isLoadingContent ? (
                        <div className="py-12 text-center text-slate-500">
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin mx-auto mb-1" />
                          <span>Extracting text from Google Drive...</span>
                        </div>
                      ) : (
                        previewContent
                      )}
                    </div>
                  </div>
                </div>

                {/* Import Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewContent('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleImport}
                    disabled={isImporting || !previewContent || isLoadingContent}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>{isImporting ? 'Ingesting...' : 'Import to Knowledge'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <HardDrive className="w-12 h-12 text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-300 mb-1">Select a Google Drive Document</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Choose any Google Doc, PDF, spreadsheet, or guideline from the left to preview and ingest into Mailora AI.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Drive files are securely parsed with OAuth read-only access. Zero model training on private data.</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Mailora AI Google Drive Integration v2.4
          </span>
        </div>
      </div>
    </div>
  );
};
