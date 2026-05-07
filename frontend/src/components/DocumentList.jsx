import React from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, Film, Music, CheckCircle2, Loader, Trash2 } from 'lucide-react';

export default function DocumentList({ documents, onSelectMedia, selectedMediaId, onDelete }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/5">
        <p className="text-sm text-gray-500">No documents found. Upload something to get started.</p>
      </div>
    );
  }

  const getIcon = (type) => {
    if (type === 'pdf') return <FileText className="w-5 h-5 text-blue-400" />;
    if (type === 'audio' || type === 'mp3' || type === 'wav') return <Music className="w-5 h-5 text-purple-400" />;
    return <Film className="w-5 h-5 text-rose-400" />;
  };

  return (
    <div className="space-y-3">
      {documents.map((doc, idx) => {
        const isSelected = selectedMediaId === doc.id;
        
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={doc.id} 
            className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
              isSelected 
                ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            {isSelected && (
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500" />
            )}
            
            <div className="flex justify-between items-start mb-2 gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-purple-500/20' : 'bg-black/30'}`}>
                  {getIcon(doc.file_type)}
                </div>
                <div className="truncate">
                  <span className="font-medium text-sm text-gray-200 block truncate" title={doc.filename}>{doc.filename}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{doc.file_type}</span>
                </div>
              </div>
              
              {doc.file_type === 'media' && (
                <button 
                  className={`shrink-0 p-2 rounded-xl transition-colors ${
                    isSelected 
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  onClick={() => onSelectMedia(doc)}
                  title="Play Media"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              )}
              
              <button 
                className="shrink-0 p-2 rounded-xl transition-colors bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                title="Delete Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-3">
              {doc.summary ? (
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">AI Summary</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                    {doc.summary}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-500 italic p-2 bg-white/5 rounded-lg border border-white/5">
                  <Loader className="w-3 h-3 animate-spin" />
                  Generating summary...
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
