import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import DocumentViewer from './DocumentViewer';

export default function Workspace({
  documents = [],
  activeDocument,
  setActiveDocument,
  selectedDocIds,
  toggleDocSelection,
  onOpenUpload,
  onOpenSourceDetail,
  onDeleteDocument,
  currentView,
  setCurrentView,
}) {
  const [seekTime, setSeekTime] = useState(null);
  const [seekKey, setSeekKey] = useState(0);
  const [activeCitationHighlight, setActiveCitationHighlight] = useState(false);
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'viewer' (for small screens)

  const handleTimestampClick = (seconds, docId) => {
    // If a specific document ID is associated with the citation, switch to it
    if (docId) {
      const targetDoc = documents.find((d) => d.id === docId);
      if (targetDoc) setActiveDocument(targetDoc);
    }
    setSeekTime(seconds);
    setSeekKey((prev) => prev + 1);
    setMobileTab('viewer');
  };

  const handlePageClick = (pageNumber) => {
    setActiveCitationHighlight(true);
    setMobileTab('viewer');
    setTimeout(() => setActiveCitationHighlight(false), 3000);
  };

  return (
    <div className="flex-1 flex w-full h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Column 1: Sidebar (Left) */}
      <Sidebar
        documents={documents}
        activeDocument={activeDocument}
        setActiveDocument={(doc) => {
          setActiveDocument(doc);
          setMobileTab('viewer');
        }}
        selectedDocIds={selectedDocIds}
        toggleDocSelection={toggleDocSelection}
        onOpenUpload={onOpenUpload}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onDeleteDocument={onDeleteDocument}
      />

      {/* Mobile Tab Toggle (under 1024px) */}
      <div className="lg:hidden absolute top-2 right-4 z-30 flex items-center bg-surface-container rounded-lg p-0.5 border border-outline-variant shadow-xs">
        <button
          onClick={() => setMobileTab('chat')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            mobileTab === 'chat'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMobileTab('viewer')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            mobileTab === 'viewer'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant'
          }`}
        >
          Source Viewer
        </button>
      </div>

      {/* Column 2: Chat Thread (Center) */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${
          mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <Chat
          activeDocument={activeDocument}
          onTimestampClick={handleTimestampClick}
          onPageClick={handlePageClick}
          onOpenUpload={onOpenUpload}
        />
      </div>

      {/* Column 3: Context-Aware Document / Media Viewer (Right) */}
      <div
        className={`h-full overflow-hidden ${
          mobileTab === 'viewer' ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'
        }`}
      >
        <DocumentViewer
          activeDocument={activeDocument}
          seekTime={seekTime}
          seekKey={seekKey}
          onOpenSourceDetail={onOpenSourceDetail}
          activeCitationHighlight={activeCitationHighlight}
        />
      </div>
    </div>
  );
}
