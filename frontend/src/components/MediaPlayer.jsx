import React, { useEffect, useRef, useState, useMemo } from 'react';

// Stable visualizer bars for audio mode
const AUDIO_BARS = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  height: `${Math.floor(Math.sin(i * 0.4) * 35 + 45)}%`,
}));

const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a']);

export default function MediaPlayer({
  src,
  seekTime,
  seekKey,
  type = 'video',
  title = 'Media Player',
  citations = [],
  onCitationClick,
}) {
  const mediaRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);

  // Audio vs video detection
  const isAudio = useMemo(() => {
    if (type === 'audio') return true;
    if (title) {
      const ext = title.slice(title.lastIndexOf('.')).toLowerCase();
      if (AUDIO_EXTS.has(ext)) return true;
    }
    return false;
  }, [type, title]);

  // Handle seek intent from parent citation clicks
  useEffect(() => {
    if (seekTime !== null && seekTime !== undefined && mediaRef.current) {
      mediaRef.current.currentTime = seekTime;
      mediaRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback blocked or deferred:', err);
      });
    }
  }, [seekKey, seekTime]);

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    } else {
      mediaRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration || 0);
    }
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedCycle = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = nextRate;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (mediaRef.current) {
      mediaRef.current.volume = val;
      mediaRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    mediaRef.current.muted = nextMute;
  };

  const toggleFullscreen = () => {
    if (mediaRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      } else {
        mediaRef.current.parentElement?.requestFullscreen?.();
      }
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      {/* Title bar */}
      <div className="px-4 py-2.5 border-b border-outline-variant bg-surface flex items-center justify-between text-xs font-medium text-on-surface">
        <div className="flex items-center gap-2 truncate">
          <span className="material-symbols-outlined text-primary text-[18px]">
            {isAudio ? 'audio_file' : 'video_file'}
          </span>
          <span className="truncate">{title}</span>
        </div>
        <span className="text-[11px] text-on-surface-variant font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Media Canvas Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[220px]">
        {error ? (
          <div className="text-center p-6 text-white/70">
            <span className="material-symbols-outlined text-error text-[36px] mb-2">
              error
            </span>
            <p className="text-xs font-semibold">Unable to stream media</p>
            <p className="text-[11px] text-white/50 mt-1">{error}</p>
          </div>
        ) : isAudio ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#141b2b] to-[#0a0e17] text-white relative">
            <audio
              ref={mediaRef}
              src={src}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={() => setError('Audio codec unsupported or network error.')}
            />

            {/* Audio Waveform Bars visualization */}
            <div className="flex items-end justify-center gap-1 w-full max-w-sm h-28 my-2 px-4">
              {AUDIO_BARS.map((bar, i) => {
                const isActive = (i / AUDIO_BARS.length) * 100 <= progressPercent;
                return (
                  <div
                    key={bar.id}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      isActive ? 'bg-primary-container' : 'bg-surface-variant/40'
                    }`}
                    style={{
                      height: bar.height,
                      opacity: isPlaying ? 0.9 : 0.4,
                      transform: isPlaying ? 'scaleY(1.05)' : 'scaleY(0.9)',
                    }}
                  />
                );
              })}
            </div>

            <p className="text-xs text-white/70 mt-2 font-medium truncate max-w-xs text-center">
              {title}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black relative group">
            <video
              ref={mediaRef}
              src={src}
              className="w-full h-full max-h-full object-contain cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={() => setError('Video codec unsupported or network error.')}
            />

            {/* Big center play icon overlay if paused */}
            {!isPlaying && !error && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-primary/90 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer backdrop-blur-xs"
              >
                <span
                  className="material-symbols-outlined text-[32px] ml-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Timeline with Amber Citation Markers */}
      <div className="px-4 pt-3 pb-1 bg-surface-container-lowest border-t border-outline-variant">
        <div className="relative w-full h-4 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />

          {/* AI Citation Markers (Amber Pins) */}
          {citations && citations.map((cite, idx) => {
            if (!cite.timestamp || !duration) return null;
            const percent = (cite.timestamp / duration) * 100;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (mediaRef.current) {
                    mediaRef.current.currentTime = cite.timestamp;
                    mediaRef.current.play();
                    setIsPlaying(true);
                  }
                  if (onCitationClick) onCitationClick(cite);
                }}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-secondary-container border border-white hover:scale-130 transition-transform shadow-sm cursor-pointer z-10"
                style={{ left: `${Math.min(Math.max(percent, 2), 98)}%` }}
                title={`Citation at ${formatTime(cite.timestamp)}`}
              />
            );
          })}
        </div>

        {/* Media Controls Toolbar */}
        <div className="flex items-center justify-between py-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full hover:bg-surface-container text-primary transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={toggleMute}
                className="p-1 rounded hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isMuted || volume === 0
                    ? 'volume_off'
                    : volume < 0.5
                    ? 'volume_down'
                    : 'volume_up'}
                </span>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSpeedCycle}
              className="px-2 py-1 rounded hover:bg-surface-container font-medium text-xs cursor-pointer"
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            {!isAudio && (
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded hover:bg-surface-container cursor-pointer"
                title="Fullscreen"
              >
                <span className="material-symbols-outlined text-[18px]">
                  fullscreen
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
