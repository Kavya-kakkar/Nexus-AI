import React, { useState, useMemo } from 'react';

export default function SourceLibrary({
  documents = [],
  onSelectDocument,
  onOpenUpload,
  onOpenSummary,
  onOpenSourceDetail,
  onDeleteDocument,
  searchQuery = '',
  setSearchQuery,
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pdf' | 'audio' | 'video'

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        filterType === 'all' || doc.file_type === filterType;

      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, filterType]);

  const getFileBadge = (type) => {
    switch (type) {
      case 'pdf':
        return {
          icon: 'description',
          label: 'PDF Document',
          bgColor: 'bg-primary/10 text-primary',
        };
      case 'audio':
        return {
          icon: 'audio_file',
          label: 'Audio Recording',
          bgColor: 'bg-secondary-container/20 text-secondary',
        };
      case 'video':
        return {
          icon: 'video_file',
          label: 'Video Presentation',
          bgColor: 'bg-tertiary-container/20 text-tertiary',
        };
      default:
        return {
          icon: 'draft',
          label: 'Document',
          bgColor: 'bg-surface-variant text-on-surface-variant',
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently added';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently added';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
      {/* Content Area */}
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Source Library
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">
              Manage and analyze all your uploaded documents, audio recordings, and
              video presentations.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-xs md:text-sm font-semibold hover:bg-surface-tint transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Source</span>
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Sources', count: documents.length },
              {
                id: 'pdf',
                label: 'PDFs',
                count: documents.filter((d) => d.file_type === 'pdf').length,
              },
              {
                id: 'audio',
                label: 'Audio',
                count: documents.filter((d) => d.file_type === 'audio').length,
              },
              {
                id: 'video',
                label: 'Videos',
                count: documents.filter((d) => d.file_type === 'video').length,
              },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterType(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  filterType === pill.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterType === pill.id
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Filter by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Source Cards Grid */}
        {filteredDocs.length === 0 ? (
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4 text-primary">
              <span className="material-symbols-outlined text-[36px]">
                folder_off
              </span>
            </div>
            <h3 className="text-base font-bold text-on-surface mb-1">
              {searchQuery ? 'No matching sources found' : 'No sources uploaded yet'}
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `No documents match "${searchQuery}". Try a different search term or clear the filter.`
                : 'Upload PDFs, recordings, or videos to start extracting verified citations and asking questions.'}
            </p>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-surface-tint transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Upload Your First Source</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => {
              const badge = getFileBadge(doc.file_type);

              return (
                <div
                  key={doc.id}
                  className="bg-surface-container-lowest border border-outline-variant hover:border-primary/50 rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all group relative flex flex-col justify-between hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] cursor-pointer"
                  onClick={() => onSelectDocument(doc)}
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${badge.bgColor}`}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {badge.icon}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {doc.summary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSummary(doc);
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors cursor-pointer"
                            title="View Summary"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              summarize
                            </span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSourceDetail(doc);
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors cursor-pointer"
                          title="Open Full Detail"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            open_in_new
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument(doc.id);
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-md transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>

                    <h3
                      className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1 mb-1"
                      title={doc.filename}
                    >
                      {doc.filename}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant mb-4">
                      Added {formatDate(doc.created_at)} • {badge.label}
                    </p>
                  </div>

                  {/* Bottom Status & CTA */}
                  <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                    {doc.summary ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-tertiary-container/15 text-tertiary rounded-full text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        <span>Ready for Q&amp;A</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-container/15 text-primary rounded-full text-[10px] font-semibold animate-pulse">
                        <span className="material-symbols-outlined text-[12px]">
                          sync
                        </span>
                        <span>Processing AI Index...</span>
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Open</span>
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
