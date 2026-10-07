import React, { useState } from 'react';
import MediaPlayer from './MediaPlayer';
import { documentsApi } from '../services/api';

export default function DocumentViewer({
  activeDocument,
  seekTime,
  seekKey,
  onOpenSourceDetail,
  activeCitationHighlight,
}) {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!activeDocument) {
    return (
      <aside className="hidden lg:flex w-105 xl:w-115 h-full flex-col bg-surface shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] items-center justify-center p-8 text-center border-l border-outline-variant/60">
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-3">
          <span className="material-symbols-outlined text-[32px]">
            visibility
          </span>
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-1">
          No Source Selected
        </h3>
        <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
          Select a PDF document or media recording from the left sidebar to inspect
          verified citations and full transcripts side-by-side.
        </p>
      </aside>
    );
  }

  const isMedia =
    activeDocument.file_type === 'audio' ||
    activeDocument.file_type === 'video';
  const mediaUrl = documentsApi.getMediaUrl(activeDocument.id);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 70), 160));
  };

  return (
    <aside className="hidden lg:flex w-105 xl:w-115 h-full flex-col bg-surface shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] border-l border-outline-variant/60">
      {/* Viewer Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {isMedia
              ? activeDocument.file_type === 'audio'
                ? 'audio_file'
                : 'video_file'
              : 'picture_as_pdf'}
          </span>
          <h3
            className="text-xs font-semibold text-on-surface truncate max-w-24"
            title={activeDocument.filename}
          >
            {activeDocument.filename}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isMedia && (
            <>
              <button
                onClick={() => handleZoom(10)}
                className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[18px]">
                  zoom_in
                </span>
              </button>
              <button
                onClick={() => handleZoom(-10)}
                className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[18px]">
                  zoom_out
                </span>
              </button>
              <div className="w-1 h-4 bg-outline-variant mx-1"></div>
            </>
          )}

          {/* Raw File Download/View Link */}
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Download / Open Raw File"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
          </a>

          {/* Expand to Dedicated Source Detail */}
          <button
            onClick={() => onOpenSourceDetail && onOpenSourceDetail(activeDocument)}
            className="p-1 rounded hover:bg-surface-container text-primary transition-colors cursor-pointer"
            title="Open Full Screen Source Detail"
          >
            <span className="material-symbols-outlined text-[18px]">
              open_in_new
            </span>
          </button>
        </div>
      </div>

      {/* Viewer Body */}
      <div className="flex-1 overflow-y-auto bg-surface-container-low p-4 flex flex-col items-center custom-scrollbar">
        {isMedia ? (
          <div className="w-full h-full flex flex-col">
            <div className="h-70 w-full">
              <MediaPlayer
                src={mediaUrl}
                seekTime={seekTime}
                seekKey={seekKey}
                type={activeDocument.file_type}
                title={activeDocument.filename}
              />
            </div>

            {/* Transcript & Summary Extract */}
            {activeDocument.summary && (
              <div className="mt-4 bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-xs">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-2">
                  <span className="material-symbols-outlined text-[18px]">
                    auto_awesome
                  </span>
                  <span>AI Extraction Summary</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {activeDocument.summary}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* PDF Simulation & Citation Viewer */
          <div
            className="w-full max-w-md transition-all duration-150"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Page 1 Document Paper */}
            <div className="bg-surface-container-lowest shadow-sm border border-outline-variant p-6 rounded-lg mb-4 text-xs">
              <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-6 pb-2 border-b border-outline-variant/40">
                <span className="font-semibold text-primary">
                  {activeDocument.filename}
                </span>
                <span>Page 1 of Document</span>
              </div>

              {activeDocument.summary ? (
                <>
                  <h4 className="font-bold text-sm text-on-surface mb-2">
                    Executive Document Synthesis
                  </h4>
                  <div className="leading-relaxed text-on-surface-variant mb-4 whitespace-pre-wrap">
                    {activeDocument.summary}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-surface-container-low rounded-lg mb-4 text-center">
                  <span className="text-xs text-on-surface-variant animate-pulse">
                    Processing document text and vector index...
                  </span>
                </div>
              )}

              {/* Highlighted Citation Card simulating Stitch Page Reference */}
              <div
                className={`relative bg-secondary-fixed-dim/15 border-l-4 border-secondary-container p-3 my-4 rounded-r-md transition-all ${
                  activeCitationHighlight
                    ? 'ring-2 ring-secondary-container bg-secondary-fixed-dim/30'
                    : 'hover:bg-secondary-fixed-dim/25'
                }`}
              >
                <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  <span>Verified Citation Excerpt</span>
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  Logistics and operational expenditures{' '}
                  <span className="bg-secondary-fixed-dim/40 font-medium px-1 rounded">
                    increased by 14% year-over-year
                  </span>
                  , directly impacting gross margin targets. A dedicated{' '}
                  <span className="bg-secondary-fixed-dim/40 font-medium px-1 rounded">
                    $2.5M provision
                  </span>{' '}
                  was allocated to European data compliance frameworks.
                </p>
              </div>

              {/* OpEx Breakdown Graphic simulation */}
              <div className="mt-4 pt-4 border-t border-outline-variant/40">
                <h5 className="font-semibold text-[11px] text-on-surface mb-2">
                  Operational Breakdown (Extracted Metrics)
                </h5>
                <div className="h-28 bg-surface-variant/40 rounded-lg p-3 flex items-end justify-between gap-3">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/40 h-[60%] rounded-t-sm"></div>
                    <span className="text-[9px] text-outline">Q1</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/60 h-[75%] rounded-t-sm"></div>
                    <span className="text-[9px] text-outline">Q2</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary h-[90%] rounded-t-sm relative">
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-secondary-container ring-1 ring-white"></div>
                    </div>
                    <span className="text-[9px] text-primary font-bold">Q3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/30 h-[45%] rounded-t-sm"></div>
                    <span className="text-[9px] text-outline">Q4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Additional Page */}
            <div className="bg-surface-container-lowest shadow-sm border border-outline-variant p-6 rounded-lg opacity-80 text-xs">
              <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-4">
                <span>Page 2</span>
                <span className="text-outline">Section 4.0 Guidance</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Strategic initiatives remain focused on deep learning acceleration
                and automated verification pipelines.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
