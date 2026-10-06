import React from 'react';

export default function Sidebar({
  documents = [],
  activeDocument,
  setActiveDocument,
  selectedDocIds,
  toggleDocSelection,
  onOpenUpload,
  currentView,
  setCurrentView,
  onDeleteDocument,
}) {
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'description';
      case 'audio':
        return 'audio_file';
      case 'video':
        return 'video_file';
      default:
        return 'draft';
    }
  };

  return (
    <aside className="hidden md:flex flex-col h-full p-4 space-y-4 bg-surface-container-low border-r border-outline-variant w-64 shrink-0 overflow-y-auto">
      {/* Workspace Header */}
      <div className="px-2 py-1">
        <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
          Current Project
        </p>
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span>Workspace</span>
          <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {documents.length} sources
          </span>
        </h2>
      </div>

      {/* Main Nav Items */}
      <nav className="flex flex-col space-y-1">
        <button
          onClick={() => setCurrentView('library')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
            currentView === 'library'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">folder_open</span>
          <span>Library</span>
        </button>

        <button
          onClick={() => setCurrentView('workspace')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
            currentView === 'workspace'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={currentView === 'workspace' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            workspaces
          </span>
          <span>Workspaces</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
            currentView === 'settings'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>Settings</span>
        </button>
      </nav>

      <hr className="border-outline-variant/60" />

      {/* Active Sources Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center px-2 mb-2">
          <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
            Active Sources
          </h3>
          <span className="text-[10px] text-on-surface-variant font-medium">
            {selectedDocIds?.size || 0} active
          </span>
        </div>

        {/* Add Source CTA */}
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-bright border border-outline-variant text-primary text-xs font-medium py-2 rounded-lg transition-colors mb-3 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Source</span>
        </button>

        {/* Source List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
          {documents.length === 0 ? (
            <div className="p-3 text-center border border-dashed border-outline-variant rounded-lg">
              <span className="material-symbols-outlined text-outline text-[24px] mb-1">
                upload_file
              </span>
              <p className="text-xs text-on-surface-variant">No sources added</p>
              <p className="text-[10px] text-outline mt-0.5">
                Upload PDFs, audio, or video files
              </p>
            </div>
          ) : (
            documents.map((doc) => {
              const isChecked = selectedDocIds ? selectedDocIds.has(doc.id) : true;
              const isSelected = activeDocument?.id === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocument(doc)}
                  className={`group flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-surface-container-high border-primary/40 shadow-xs'
                      : 'border-transparent hover:bg-surface-container hover:border-outline-variant/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDocSelection(doc.id);
                    }}
                    className="mt-0.5 rounded text-primary focus:ring-primary/40 border-outline-variant bg-surface cursor-pointer"
                    title="Toggle source in Q&A context"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                        {getFileIcon(doc.file_type)}
                      </span>
                      <p
                        className={`text-xs truncate font-medium ${
                          isSelected ? 'text-primary' : 'text-on-surface'
                        }`}
                        title={doc.filename}
                      >
                        {doc.filename}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-on-surface-variant">
                      <span className="uppercase font-mono text-[10px]">
                        {doc.file_type}
                      </span>
                      {doc.summary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-tertiary font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          Processing
                        </span>
                      )}
                    </div>
                  </div>

                  {onDeleteDocument && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all cursor-pointer"
                      title="Delete source"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Support */}
      <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-on-surface-variant">
        <span className="font-medium text-outline">Nexus-AI Core v2.4</span>
        <button
          onClick={() => setCurrentView('landing')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Docs
        </button>
      </div>
    </aside>
  );
}
