import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentsApi } from '../services/api';

const ALLOWED_EXTS = ['.pdf', '.mp3', '.wav', '.mp4', '.mkv'];

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setErrorMsg('');
    if (rejectedFiles && rejectedFiles.length > 0) {
      setErrorMsg(
        'Unsupported file format — please upload a PDF, MP3, WAV, MP4, or MKV file.'
      );
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setErrorMsg(
          `Unsupported file format (${ext}). Supported formats: PDF, MP3, WAV, MP4, MKV.`
        );
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 150 * 1024 * 1024, // 150MB
  });

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(15);
    setErrorMsg('');

    try {
      const newDoc = await documentsApi.upload(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(Math.max(percent, 20));
        }
      });
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        setProgress(0);
        if (onUploadSuccess) onUploadSuccess(newDoc);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploading(false);
      setErrorMsg(
        err.response?.data?.detail ||
          'Upload failed. Please check your backend connection and file size.'
      );
    }
  };

  const getFormatIcon = (filename) => {
    if (!filename) return 'description';
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    if (ext === '.pdf') return 'picture_as_pdf';
    if (ext === '.mp3' || ext === '.wav') return 'audio_file';
    if (ext === '.mp4' || ext === '.mkv') return 'video_file';
    return 'description';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant w-full max-w-2xl overflow-hidden shadow-[0px_8px_32px_rgba(0,0,0,0.12)] relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              cloud_upload
            </span>
            <h2 className="text-base font-bold text-on-surface">
              Upload New Source
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-5">
          {/* Error Banner matching Stitch upload_error_state */}
          {errorMsg && (
            <div className="bg-error-container text-on-error-container border border-error/50 rounded-xl p-4 flex items-start gap-3 shadow-xs">
              <span
                className="material-symbols-outlined text-error text-[22px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              <div className="text-xs">
                <h4 className="font-bold text-error mb-0.5">Upload Failed</h4>
                <p className="text-on-error-container leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Dropzone Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              errorMsg
                ? 'border-error bg-error-container/10'
                : isDragActive
                ? 'border-primary bg-primary-fixed/20 scale-[0.99]'
                : 'border-outline-variant hover:border-primary/60 bg-surface-container-low/50 hover:bg-surface-container-low'
            }`}
          >
            <input {...getInputProps()} />

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
                errorMsg
                  ? 'bg-error-container text-error'
                  : 'bg-primary-fixed text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {errorMsg ? 'error' : isDragActive ? 'download' : 'upload_file'}
              </span>
            </div>

            <h3 className="text-sm font-bold text-on-surface mb-1">
              {isDragActive
                ? 'Drop file here to upload'
                : 'Drag & drop source files here, or click to browse'}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
              Accepts PDF documents, MP3/WAV audio recordings, and MP4/MKV video
              files (up to 150 MB).
            </p>
          </div>

          {/* Selected File Card Preview */}
          {selectedFile && (
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    {getFormatIcon(selectedFile.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {!uploading && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Progress Bar during Upload */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-on-surface font-semibold">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Uploading &amp; Extracting Vectors...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer CTAs */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedFile && !uploading
                  ? 'bg-primary text-on-primary hover:bg-surface-tint shadow-xs'
                  : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    sync
                  </span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    upload
                  </span>
                  <span>Confirm Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
