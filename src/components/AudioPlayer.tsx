"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Share2, Heart, Music } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';

export default function AudioPlayer() {
    const { currentTrack, isPlaying, setIsPlaying, incrementPlays } = useMusic();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [hasBeenCounted, setHasBeenCounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset count flag when track changes
    useEffect(() => {
        setHasBeenCounted(false);
    }, [currentTrack?.id]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed", e));

                // Increment plays if not already counted for this session
                if (currentTrack && !hasBeenCounted) {
                    incrementPlays(currentTrack.id);
                    setHasBeenCounted(true);
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack, hasBeenCounted, incrementPlays]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = e.currentTarget;
        if (!progressBar || !audioRef.current || !duration) return;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = (x / rect.width) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
    };

    if (!mounted || !currentTrack) return null;

    return (
        <div className="footer-player relative w-full h-[90px] bg-gradient-to-r from-[#0f0a1c]/90 via-[#1a1025]/80 to-[#0f0a1c]/90 backdrop-blur-3xl border-t border-white/10 px-4 md:px-8 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(var(--accent-page-rgb),0.15)]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-page)]/50 to-transparent shadow-[0_0_10px_rgba(var(--accent-page-rgb),0.5)]" />
            <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Track Info - Left */}
            <div className="track-info flex items-center gap-4 w-1/3 min-w-[200px]">
                <div className={`mini-cover w-14 h-14 rounded-full bg-black/80 overflow-hidden border-2 border-white/10 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform duration-700 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                    {currentTrack.cover ? (
                        <img
                            src={currentTrack.cover}
                            alt={currentTrack.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Music size={16} className="text-white/30" />
                    )}
                </div>
                <div className="details truncate flex-1">
                    <h4 className="font-black text-[13px] truncate leading-tight tracking-tight text-white mb-0.5">{currentTrack.title}</h4>
                    <p className="text-[11px] text-white/50 truncate font-semibold uppercase tracking-wider">{currentTrack.artist}</p>
                </div>
                <Heart size={18} className="text-white/40 hover:text-pink-500 cursor-pointer shrink-0 ml-2 transition-colors hover:scale-110 active:scale-95" />
            </div>

            {/* Controls Center */}
            <div className="controls-center flex flex-col items-center gap-1.5 w-1/3 max-w-[600px]">
                <div className="flex items-center gap-6">
                    <button className="text-white/50 hover:text-white transition-colors hover:scale-110"><SkipBack size={18} /></button>
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-page)] to-pink-500 flex-center text-white shadow-[0_0_25px_rgba(var(--accent-page-rgb),0.4)] hover:scale-105 transition-all active:scale-95 border border-white/20"
                    >
                        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
                    </button>
                    <button className="text-white/50 hover:text-white transition-colors hover:scale-110"><SkipForward size={18} /></button>
                </div>
                <div className="w-full flex items-center gap-3 text-[10px] text-white/40 font-bold font-mono tabular-nums">
                    <span className="w-8 text-right">{formatTime(progress)}</span>
                    <div
                        className="flex-1 h-1.5 bg-black/40 rounded-full cursor-pointer relative group border border-white/5 hover:h-2 transition-all"
                        onClick={handleSeek}
                    >
                        <div
                            className="absolute h-full bg-gradient-to-r from-[var(--accent-page)] to-pink-400 rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(var(--accent-page-rgb),0.8)] relative"
                            style={{ width: `${(progress / duration) * 100 || 0}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-x-1.5" />
                        </div>
                    </div>
                    <span className="w-8">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Actions - Right */}
            <div className="player-actions flex items-center justify-end gap-6 w-1/3 min-w-[150px]">
                <div className="volume-control flex items-center gap-3 hidden sm:flex opacity-60 hover:opacity-100 transition-opacity">
                    <Volume2 size={18} className="text-white/80" />
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <div className="w-2/3 h-full bg-white/80 rounded-full" />
                    </div>
                </div>
                <button className="text-white/40 hover:text-white transition-colors hover:scale-110">
                    <Share2 size={18} />
                </button>
            </div>
        </div>
    );
}
