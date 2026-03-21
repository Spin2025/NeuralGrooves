'use client';

import React, { useState, Suspense } from 'react';
import { Play, Search, Trash2, Sparkles, Music, TrendingUp, Clock } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

function DiscoveryContent() {
    const { tracks, setCurrentTrack, setIsPlaying, deleteTrack, isAdmin } = useMusic();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [activeMood, setActiveMood] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    const isTrending = searchParams.get('sort') === 'tendencias';

    const getFilterTerm = (mood: string) => {
        if (mood === 'Suno V5') return 'suno'; // Broad match for Suno
        return mood.toLowerCase();
    };

    let processedTracks = tracks.filter(track => {
        // Mood / Engine filter
        const engineSearchParam = getFilterTerm(activeMood);
        const trackAiLower = (track.ai || '').toLowerCase();
        const matchesMood = activeMood === 'All' || trackAiLower.includes(engineSearchParam) || (track.genre || '').toLowerCase().includes(engineSearchParam);
        
        // Text Search Filter (Title, Artist, AI Engine)
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = 
            !q || 
            (track.title || '').toLowerCase().includes(q) ||
            (track.artist || '').toLowerCase().includes(q) ||
            trackAiLower.includes(q);
            
        return matchesMood && matchesSearch;
    });

    // Sorting Logic
    if (isTrending) {
        processedTracks = [...processedTracks].sort((a, b) => (Number(b.plays) || 0) - (Number(a.plays) || 0));
    } else {
        processedTracks = [...processedTracks].sort((a, b) => {
            if (typeof a.id === 'string' && typeof b.id === 'string') return b.id.localeCompare(a.id);
            return 0;
        });
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="discovery-container p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen relative z-10 w-full">
            {/* Background elements for friendly feel */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--accent-page)]/20 to-transparent pointer-events-none -z-10" />
            <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="absolute top-20 left-0 w-96 h-96 bg-[var(--accent-page)]/15 blur-[120px] rounded-full pointer-events-none -z-10" />

            <header className="mb-14 relative pt-12 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                        <Sparkles size={16} className="text-[var(--accent-page)]" />
                        <span className="text-xs font-semibold tracking-wide text-white/90 uppercase">Tu música, potenciada por IA</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60">
                        Descubre tu<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-page)] to-pink-400 drop-shadow-lg">
                            Nuevo Sonido
                        </span>
                    </h1>
                    <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                        Explora melodías únicas generadas por algoritmos avanzados y curadas para una experiencia auditiva envolvente.
                    </p>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
                    className="relative hidden md:flex items-center justify-center p-8"
                >
                     <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[var(--accent-page)]/40 via-pink-500/30 to-blue-500/20 flex-center border-2 border-white/20 glass-premium animate-float shadow-[0_0_80px_rgba(var(--accent-page-rgb),0.4)] backdrop-blur-2xl">
                        <Music size={72} className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]" />
                     </div>
                </motion.div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="search-filters-section glass-premium p-4 rounded-3xl mb-12 flex flex-col xl:flex-row justify-between items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/10"
            >
                <div className="search-bar w-full xl:w-[400px] relative group shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search size={20} className="text-white/40 group-focus-within:text-[var(--accent-page)] transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por título, artista o motor (Ej: Suno)..."
                        className="w-full bg-black/20 border border-white/5 focus:border-[var(--accent-page)]/50 rounded-2xl py-3.5 pl-14 pr-5 text-[15px] font-medium text-white placeholder-white/30 outline-none transition-all focus:bg-white/10 focus:shadow-[0_0_25px_rgba(var(--accent-page-rgb),0.15)]"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-bold transition-all ${!isTrending ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                        <Clock size={16} /> Recientes
                    </button>
                    <button
                        onClick={() => router.push('/?sort=tendencias')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-bold transition-all ${isTrending ? 'bg-[var(--accent-page)]/20 text-[var(--accent-page)] border border-[var(--accent-page)]/30' : 'text-white/50 hover:text-white/80'}`}
                    >
                        <TrendingUp size={16} /> Tendencias
                    </button>
                </div>

                <div className="mood-filters flex gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 scrollbar-hide py-1 px-1">
                    {['All', 'Suno V5', 'Udio', 'TopMediai', 'Mubert', 'Custom'].map((mood) => (
                        <button
                            key={mood}
                            onClick={() => setActiveMood(mood)}
                            className={`px-6 py-3 rounded-2xl text-[14px] font-bold transition-all shrink-0 relative overflow-hidden group ${
                                activeMood === mood 
                                    ? 'text-white shadow-[0_0_20px_rgba(var(--accent-page-rgb),0.4)]' 
                                    : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
                            }`}
                        >
                            {activeMood === mood && (
                                <motion.div 
                                    layoutId="activeMoodBg"
                                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-page)] to-pink-500 opacity-90 -z-10"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{mood}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {processedTracks.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-32 text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex-center mb-6">
                        <Music size={32} className="text-white/30" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No encontramos resultados</h3>
                    <p className="text-white/60 text-lg">Intenta con otra búsqueda o selecciona un motor diferente.</p>
                </motion.div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6"
                >
                    <AnimatePresence>
                        {processedTracks.map(track => (
                            <motion.div
                                key={track.id}
                                variants={itemVariants}
                                layout
                                className="track-card p-3 sm:p-4 rounded-[2rem] glass-premium group cursor-pointer border border-white/10 hover:border-[var(--accent-page)]/60 hover:bg-white/[0.04] transition-all duration-500 hover:shadow-[0_15px_40px_-5px_rgba(var(--accent-page-rgb),0.4)] relative overflow-hidden"
                                onClick={() => {
                                    setCurrentTrack(track);
                                    setIsPlaying(true);
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--accent-page)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl border border-white/5 bg-black/50">
                                        {/* Admin Delete */}
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`¿Eliminar "${track.title}"?`)) {
                                                        deleteTrack(track.id);
                                                    }
                                                }}
                                                className="absolute top-3 right-3 z-50 p-2.5 bg-black/70 backdrop-blur-md border border-red-500/50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100 shadow-2xl"
                                                title="Eliminar (Admin)"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <img
                                            src={track.cover}
                                            alt={track.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300" />
                                        
                                        {/* Glass reflection overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        
                                        <div className="absolute inset-0 flex-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <motion.div 
                                                whileHover={{ scale: 1.15 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="w-14 h-14 rounded-full bg-[var(--accent-page)] flex-center shadow-[0_0_30px_rgba(var(--accent-page-rgb),0.8)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-white"
                                            >
                                                <Play fill="white" size={24} className="ml-1" />
                                            </motion.div>
                                        </div>
                                    </div>
                                    <div className="px-3 pb-2 pt-4 relative z-10 flex flex-col gap-3">
                                        <div className="flex-1 w-full flex flex-col items-center text-center">
                                            <h3 className="font-bold text-[16px] w-full truncate leading-tight tracking-tight text-white/95 mb-1 group-hover:text-white transition-colors">{track.title}</h3>
                                            <p className="text-[12px] text-white/50 truncate font-semibold w-full group-hover:text-white/70 transition-colors">{track.artist}</p>
                                        </div>
                                    <div className="flex justify-between items-center w-full pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg">
                                            <Play size={10} className="text-[var(--accent-page)] fill-[var(--accent-page)]" />
                                            <span className="text-[10px] font-bold text-white/80">{track.plays || 0}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-[var(--accent-page)] px-2.5 py-1 rounded-lg bg-[var(--accent-page)]/10 border border-[var(--accent-page)]/20">
                                            {(track.ai || 'IA').split(',')[0]}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

export default function DiscoveryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center text-white"><Music className="animate-pulse opacity-50" size={32} /></div>}>
            <DiscoveryContent />
        </Suspense>
    );
}

