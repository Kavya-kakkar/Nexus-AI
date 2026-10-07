import React, { useState } from 'react';

export default function Navbar({
  currentView,
  setCurrentView,
  activeDocument,
  onOpenSummary,
  onOpenUpload,
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 flex-none bg-surface border-b border-outline-variant px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
      {/* Brand & Left Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
        >
          <span
            className="material-symbols-outlined text-primary text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            hexagon
          </span>
          <span className="font-extrabold text-xl tracking-tight text-primary">
            Nexus-AI
          </span>
        </button>

        {/* View Switcher Pills */}
        <nav className="hidden md:flex items-center gap-1 ml-4 bg-surface-container-low p-1 rounded-lg border border-outline-variant/60">
          <button
            onClick={() => setCurrentView('workspace')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'workspace'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">workspaces</span>
            Workspace
          </button>
          <button
            onClick={() => setCurrentView('library')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'library'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder_open</span>
            Library
          </button>
        </nav>
      </div>

      {/* Center Session Title & Summary Toggle (Workspace mode) */}
      {currentView === 'workspace' && (
        <div className="hidden lg:flex items-center bg-surface-container-low rounded-full p-1 border border-outline-variant shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
          <div className="px-3 py-1 flex items-center gap-2 max-w-xs">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
              chat
            </span>
            <span className="text-xs font-medium text-on-surface truncate">
              {activeDocument ? activeDocument.filename : 'Verified Q&A Analysis'}
            </span>
          </div>
          {activeDocument?.summary && (
            <>
              <div className="w-1 h-3.5 bg-outline-variant mx-1"></div>
              <button
                onClick={onOpenSummary}
                className="px-3 py-1 flex items-center gap-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant group cursor-pointer text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[16px] group-hover:text-primary transition-colors">
                  summarize
                </span>
                <span className="group-hover:text-primary transition-colors">
                  Summary
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Trailing Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search in Library view */}
        {currentView === 'library' && setSearchQuery && (
          <div className="hidden sm:flex items-center bg-surface-container-lowest border border-outline-variant rounded-full px-3 py-1 text-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-1.5">
              search
            </span>
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-on-surface placeholder:text-outline w-32 md:w-44 text-xs"
            />
          </div>
        )}

        {/* Upload Button Shortcut */}
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-surface-tint text-xs font-medium transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Source</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setCurrentView('settings')}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            currentView === 'settings'
              ? 'bg-primary-container text-on-primary-container'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-surface-variant cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            title={currentUser?.username || 'User Profile'}
          >
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-primary">
                {currentUser?.username
                  ? currentUser.username.charAt(0).toUpperCase()
                  : 'U'}
              </span>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-outline-variant/50">
                <p className="font-semibold text-on-surface truncate">
                  {currentUser?.full_name || currentUser?.username || 'User'}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {currentUser?.email || `@${currentUser?.username || 'user'}`}
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentView('workspace');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">workspaces</span>
                Workspace
              </button>

              <button
                onClick={() => {
                  setCurrentView('library');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                Source Library
              </button>

              <button
                onClick={() => {
                  setCurrentView('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Profile &amp; Settings
              </button>

              <div className="h-px bg-outline-variant/50 my-1"></div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 text-error hover:bg-error-container/20 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
