"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface Track {
    id: string | number;
    title: string;
    artist: string;
    ai: string;
    genre: string;
    cover: string;
    audioUrl: string;
    duration?: string;
    status?: string;
    plays: number;
}

interface MusicContextType {
    tracks: Track[];
    addTrack: (track: Track) => void;
    deleteTrack: (id: string | number) => Promise<void>;
    currentTrack: Track | null;
    setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>;
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    isAdmin: boolean;
    setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
    incrementPlays: (id: string | number) => Promise<void>;
    user: User | null;
    session: Session | null;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const INITIAL_TRACKS: Track[] = [
    {
        id: 1,
        title: 'Sin Ajuar de Niña',
        artist: 'AI Masterpiece',
        ai: 'Suno v5',
        genre: 'Latin / Ballad',
        cover: '/covers/sin-ajuar-cover.png',
        audioUrl: '/tracks/sin-ajuar.mp3',
        plays: 0
    },
    { id: 2, title: 'Neon Dreams', artist: 'AI_Synth', ai: 'Suno v5', genre: 'Synthwave', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&h=600&fit=crop', audioUrl: '', plays: 0 },
    { id: 3, title: 'Aetherial Whispers', artist: 'EtherealAI', ai: 'Udio', genre: 'Ambient', cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&h=600&fit=crop', audioUrl: '', plays: 0 },
];

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initial Load & Auth Listener
    useEffect(() => {
        setMounted(true);
        const loadTracks = async () => {
            const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            let tempAllTracks = [...INITIAL_TRACKS];

            // 1. Get from Supabase
            if (isConfigured) {
                try {
                    const { data, error } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
                    if (!error && data) {
                        const dbTracks = data.map(t => ({
                            id: t.id,
                            title: t.title,
                            artist: t.artist,
                            ai: t.ai_engine,
                            genre: t.genre,
                            cover: t.cover_url,
                            audioUrl: t.audio_url,
                            plays: t.plays || 0,
                        }));
                        tempAllTracks = [...tempAllTracks, ...dbTracks];
                    }
                } catch (e) { console.error("Supabase load failed", e); }
            }

            // 2. Get from LocalStorage
            const localSaved = localStorage.getItem('neural_grooves_tracks');
            if (localSaved) {
                try {
                    const parsed = JSON.parse(localSaved);
                    tempAllTracks = [...tempAllTracks, ...parsed];
                } catch (e) { console.error("Local load failed", e); }
            }

            // 3. Load Global Plays Map (for "eternal" stats fallback)
            const globalPlaysMap = JSON.parse(localStorage.getItem('neural_grooves_global_plays') || '{}');

            // 4. DEDUPLICATE & MERGE
            const finalMap = new Map();
            tempAllTracks.forEach(t => {
                const safeTitle = t.title || "Untitled";
                const safeArtist = t.artist || "Unknown Artist";
                const key = `${safeTitle.toLowerCase().trim()}|${safeArtist.toLowerCase().trim()}`;
                const localPlays = globalPlaysMap[key] || 0;
                const currentPlays = Math.max(t.plays || 0, localPlays);

                if (!finalMap.has(key)) {
                    finalMap.set(key, { ...t, plays: currentPlays });
                } else {
                    const existing = finalMap.get(key);
                    finalMap.set(key, {
                        ...existing,
                        plays: Math.max(existing.plays, currentPlays),
                        audioUrl: t.audioUrl || existing.audioUrl,
                        cover: t.cover || existing.cover,
                        id: t.id || existing.id
                    });
                }
            });

            const sortedTracks = Array.from(finalMap.values()).sort((a, b) => {
                // If ID is string (Date.now()), sort descending (newest first)
                if (typeof a.id === 'string' && typeof b.id === 'string') {
                    return b.id.localeCompare(a.id);
                }
                // Fallback to plays or default
                return (b.plays || 0) - (a.plays || 0);
            });

            setTracks(sortedTracks);
            if (sortedTracks.length > 0) setCurrentTrack(sortedTracks[0]);
        };

        loadTracks();

        // Load Admin Status
        const savedAdmin = localStorage.getItem('neural_grooves_admin');
        if (savedAdmin === 'true') setIsAdmin(true);

        // Auth Listener
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Persist Admin Status
    useEffect(() => {
        if (mounted) localStorage.setItem('neural_grooves_admin', isAdmin.toString());
    }, [isAdmin, mounted]);

    const addTrack = (track: Track) => {
        setTracks(prev => {
            const combined = [track, ...prev];
            // Deduplicate
            const dedup = Array.from(new Map(combined.map(t => [`${t.title}|${t.artist}`, t])).values())
                .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));

            // Persist locally
            const customUploads = dedup.filter(t => typeof t.id === 'string');
            localStorage.setItem('neural_grooves_tracks', JSON.stringify(customUploads));
            return dedup;
        });
    };

    const deleteTrack = async (id: string | number) => {
        setTracks(prev => {
            const filtered = prev.filter(t => t.id !== id);
            const customUploads = filtered.filter(t => typeof t.id === 'string');
            localStorage.setItem('neural_grooves_tracks', JSON.stringify(customUploads));
            return filtered;
        });

        if (currentTrack?.id === id) {
            setCurrentTrack(null);
            setIsPlaying(false);
        }

        if (typeof id === 'string' && id.length > 20) {
            const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (isConfigured) await supabase.from('tracks').delete().eq('id', id);
        }
    };

    const incrementPlays = async (id: string | number) => {
        const targetTrack = tracks.find(t => t.id === id);
        if (!targetTrack) return;

        setTracks(prev => prev.map(t => 
            t.id === id ? { ...t, plays: (t.plays || 0) + 1 } : t
        ));

        // 1. Update Global Plays Map (Eternal fallback)
        const safeTitle = targetTrack.title || "Untitled";
        const safeArtist = targetTrack.artist || "Unknown Artist";
        const key = `${safeTitle.toLowerCase().trim()}|${safeArtist.toLowerCase().trim()}`;
        const globalPlaysMap = JSON.parse(localStorage.getItem('neural_grooves_global_plays') || '{}');
        globalPlaysMap[key] = (globalPlaysMap[key] || 0) + 1;
        localStorage.setItem('neural_grooves_global_plays', JSON.stringify(globalPlaysMap));

        // 2. Update Supabase
        if (typeof id === 'string' && id.length > 20) {
            const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (isConfigured) {
                try {
                    const { data: track } = await supabase.from('tracks').select('plays').eq('id', id).single();
                    await supabase.from('tracks').update({ plays: (track?.plays || 0) + 1 }).eq('id', id);
                } catch (e) { console.error("Supabase increment failed", e); }
            }
        }

        // 3. Update Local Storage Tracks
        const localSaved = JSON.parse(localStorage.getItem('neural_grooves_tracks') || '[]');
        const updatedLocal = localSaved.map((t: any) =>
            (t.title === targetTrack?.title && t.artist === targetTrack?.artist)
                ? { ...t, plays: (t.plays || 0) + 1 } : t
        );
        // Ensure if it's a completely new local track somehow, it gets its plays updated too
        localStorage.setItem('neural_grooves_tracks', JSON.stringify(updatedLocal));
    };

    return (
        <MusicContext.Provider value={{
            tracks, addTrack, deleteTrack, currentTrack, setCurrentTrack, isPlaying, setIsPlaying, isAdmin, setIsAdmin, incrementPlays, user, session, isAuthModalOpen, setIsAuthModalOpen
        }}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (context === undefined) throw new Error('useMusic must be used within a MusicProvider');
    return context;
}
