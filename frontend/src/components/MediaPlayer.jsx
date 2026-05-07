import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function MediaPlayer({ src, seekTime, type, title }) {
  const mediaRef = useRef(null);

  useEffect(() => {
    if (seekTime !== null && mediaRef.current) {
      mediaRef.current.currentTime = seekTime;
      mediaRef.current.play().catch(e => console.log("Auto-play blocked", e));
    }
  }, [seekTime]);

  const isAudio = type === 'mp3' || type === 'wav' || type === 'audio';

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-black/80">
      <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between pointer-events-none">
        <h3 className="text-white/80 text-sm font-medium drop-shadow-md truncate max-w-md">{title || "Media Player"}</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 relative z-0">
        {isAudio ? (
          <div className="w-full max-w-md bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
             {/* Audio visualizer illusion */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center gap-1 px-8">
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: ["10%", `${Math.random() * 80 + 20}%`, "10%"] }}
                  transition={{ duration: Math.random() * 0.5 + 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full"
                />
              ))}
            </div>
            <audio ref={mediaRef} controls src={src} className="w-full relative z-10 audio-player-custom" />
          </div>
        ) : (
          <video ref={mediaRef} controls src={src} className="w-full h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10" />
        )}
      </div>
    </div>
  );
}
