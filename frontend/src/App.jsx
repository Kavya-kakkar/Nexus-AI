import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Workspace from './components/Workspace';
import SourceLibrary from './components/SourceLibrary';
import SourceDetail from './components/SourceDetail';
import SettingsView from './components/SettingsView';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import SummaryModal from './components/SummaryModal';
import { authApi, documentsApi } from './services/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('token') ? 'workspace' : 'landing';
  });

  // Modal / Detail state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryDoc, setSummaryDoc] = useState(null);
  const [detailDoc, setDetailDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setDocuments([]);
    setActiveDocument(null);
    setCurrentView('landing');
  }, []);

  // Listen for 401 auth-logout event from api interceptor
  useEffect(() => {
    const onAuthLogout = () => handleLogout();
    window.addEventListener('auth-logout', onAuthLogout);
    return () => window.removeEventListener('auth-logout', onAuthLogout);
  }, [handleLogout]);

  // Fetch current user details
  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const user = await authApi.getMe();
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  }, [token]);

  // Fetch documents list
  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const docs = await documentsApi.list();
      setDocuments(docs);

      // Initialize selected doc IDs
      setSelectedDocIds((prev) => {
        if (prev.size === 0 && docs.length > 0) {
          return new Set(docs.map((d) => d.id));
        }
        return prev;
      });

      // Default active document if none set
      setActiveDocument((current) => {
        if (!current && docs.length > 0) {
          return docs[0];
        }
        // If current was updated in list, update reference
        if (current) {
          const fresh = docs.find((d) => d.id === current.id);
          return fresh || docs[0] || null;
        }
        return current;
      });
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, [token]);

  // Initial load when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
      fetchDocuments();
    }
  }, [token, fetchUser, fetchDocuments]);

  // Auto-refresh when any document is still processing summary
  useEffect(() => {
    let timer;
    const hasUnfinishedDocs = documents.some((d) => !d.summary);
    if (hasUnfinishedDocs && token) {
      timer = setInterval(() => {
        fetchDocuments();
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [documents, token, fetchDocuments]);

  // Toggle document selection in context
  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Delete document
  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this source?')) return;
    try {
      await documentsApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (activeDocument?.id === id) {
        const remaining = documents.filter((d) => d.id !== id);
        setActiveDocument(remaining[0] || null);
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document.');
    }
  };

  // Auth Success callback
  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setCurrentView('workspace');
  };

  // Open Summary Modal
  const handleOpenSummary = (doc) => {
    setSummaryDoc(doc || activeDocument);
    setIsSummaryOpen(true);
  };

  // Open Source Detail View
  const handleOpenSourceDetail = (doc) => {
    setDetailDoc(doc);
    setCurrentView('detail');
  };

  // Landing Page Mode
  if (currentView === 'landing') {
    return (
      <LandingPage
        isAuthenticated={Boolean(token)}
        onGetStarted={() => {
          if (token) {
            setCurrentView('workspace');
          } else {
            setCurrentView('auth');
          }
        }}
        onLogin={() => setCurrentView('auth')}
      />
    );
  }

  // Auth Page Mode
  if (currentView === 'auth') {
    return (
      <AuthModal
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // Authenticated Application Shell
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeDocument={activeDocument}
        onOpenSummary={() => handleOpenSummary(activeDocument)}
        onOpenUpload={() => setIsUploadOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Router */}
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'workspace' && (
          <Workspace
            documents={documents}
            activeDocument={activeDocument}
            setActiveDocument={setActiveDocument}
            selectedDocIds={selectedDocIds}
            toggleDocSelection={toggleDocSelection}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenSourceDetail={handleOpenSourceDetail}
            onDeleteDocument={handleDeleteDocument}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'library' && (
          <SourceLibrary
            documents={documents}
            onSelectDocument={(doc) => {
              setActiveDocument(doc);
              setCurrentView('workspace');
            }}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenSummary={handleOpenSummary}
            onOpenSourceDetail={handleOpenSourceDetail}
            onDeleteDocument={handleDeleteDocument}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentView === 'detail' && detailDoc && (
          <SourceDetail
            document={detailDoc}
            onBack={() => setCurrentView('workspace')}
            onOpenWorkspace={(doc) => {
              setActiveDocument(doc);
              setCurrentView('workspace');
            }}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onBack={() => setCurrentView('workspace')}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Upload Source Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newDoc) => {
          fetchDocuments();
          setActiveDocument(newDoc);
          setCurrentView('workspace');
        }}
      />

      {/* Summary Highlights Modal */}
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        document={summaryDoc || activeDocument}
        onJumpToSource={(doc) => {
          setActiveDocument(doc);
          setCurrentView('workspace');
        }}
      />
    </div>
  );
}
