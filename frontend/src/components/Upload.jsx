import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { UploadCloud, File, Film, Music, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Upload({ token, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setProgress(0);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await axios.post(`${API_URL}/documents/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        });
      } catch (err) {
        console.error("Upload error", err);
      }
    }
    setUploading(false);
    onUploadSuccess();
  }, [token, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...getRootProps()} 
      className={`relative overflow-hidden border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
        ${isDragActive 
          ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'}`}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          <div className="text-sm font-medium text-purple-300">Uploading... {progress}%</div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">
              {isDragActive ? 'Drop files now' : 'Click or drag files to upload'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><File className="w-3 h-3"/> PDF</span>
              <span className="flex items-center gap-1"><Film className="w-3 h-3"/> Video</span>
              <span className="flex items-center gap-1"><Music className="w-3 h-3"/> Audio</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
