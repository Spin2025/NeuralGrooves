'use client';

import React, { useState } from 'react';
import { Upload, Music, BarChart3, Settings, ShieldCheck, Database, Info, X, Play, Trash2, Video } from 'lucide-react';
import UploadModal from '@/components/UploadModal';
import ClipMaker from '@/components/ClipMaker';
import AuthModal from '@/components/AuthModal';
import { useMusic } from '@/context/MusicContext';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { tracks, setCurrentTrack, setIsPlaying, deleteTrack, isAdmin, user, setIsAuthModalOpen } = useMusic();
    const [isFree, setIsFree] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isClipMakerOpen, setIsClipMakerOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<any>(null);

    const myTracks = (user || isAdmin) ? tracks : [];

    React.useEffect(() => {
        setMounted(true);
        if (myTracks.length > 0 && !selectedTrack) {
            setSelectedTrack(myTracks[0]);
        }
    }, [myTracks, selectedTrack]);

    const storageUsed = 7.7; // Simulación
    const storageLimit = 100; // MB
    const uploadsUsed = mounted ? tracks.filter(t => typeof t.id === 'string' || t.artist === 'You (Creator)').length : 0;
    const uploadLimit = 10;

    const handlePlay = (track: any) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    if (!mounted) return (
        <div className="flex-center h-screen">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
    );

    if (!user && !isAdmin) {
        return (
            <div className="dashboard-container p-6 md:p-10 max-w-[1400px] mx-auto min-h-screen relative z-10 w-full flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none -z-10" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass-premium p-12 rounded-[3rem] border border-white/10 max-w-lg shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[#9d4edd] to-[var(--accent-page)] rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(157,78,221,0.4)]">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Estudio Privado</h2>
                    <p className="text-white/60 mb-8 text-lg font-medium leading-relaxed">
                        Inicia sesión o crea una cuenta gratis para acceder a tu catálogo personal, gestionar tus pistas y ver tus estadísticas.
                    </p>
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full py-5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-2xl font-black text-black text-lg uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(6,182,212,0.3)] active:scale-95 border-none"
                    >
                        Entrar a Mi Estudio
                    </button>
                </motion.div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="dashboard-container p-6 md:p-10 max-w-[1400px] mx-auto min-h-[calc(100vh-100px)] relative z-10 w-full overflow-x-hidden pb-32">
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
            
            {/* Background elements for friendly feel */}
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none -z-10" />
            <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            
            <header className="mb-12 relative pt-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                        <BarChart3 size={16} className="text-cyan-400" />
                        <span className="text-xs font-semibold tracking-wide text-white/90 uppercase">Panel de Control</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 drop-shadow-md">
                        Mi Estudio <span className="text-[var(--accent-page)] glow-text text-4xl align-top block sm:inline mt-2 sm:mt-0">PRO</span>
                    </h1>
                    <p className="text-white/60 text-lg font-medium">Gestiona tu discografía generada por IA y analiza tu rendimiento.</p>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                >
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all active:scale-95"
                    >
                        <Upload size={20} className="stroke-[3px]" /> Subir Nueva Canción
                    </button>
                </motion.div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
                <div className="stats-card glass-premium p-6 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-[20px] group-hover:bg-white/10 transition-colors" />
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <Database size={20} className="text-white/60" />
                        </div>
                        {isFree && <span className="text-[10px] px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full font-bold uppercase">Plan Gratis</span>}
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Almacenamiento</h3>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-white">{storageUsed}</p>
                            <p className="text-sm font-medium text-white/40">/ {storageLimit} MB</p>
                        </div>
                    </div>
                </div>

                <div className="stats-card glass-premium p-6 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-[20px] group-hover:bg-white/10 transition-colors" />
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <Music size={20} className="text-white/60" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Pistas Subidas</h3>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-white">{uploadsUsed}</p>
                            <p className="text-sm font-medium text-white/40">/ {uploadLimit}</p>
                        </div>
                    </div>
                </div>

                <div className="stats-card glass-premium p-6 rounded-3xl border border-cyan-500/20 flex flex-col justify-between shadow-[0_10px_30px_rgba(6,182,212,0.15)] relative overflow-hidden overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-[30px] group-hover:bg-cyan-500/30 transition-colors" />
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="p-3 bg-cyan-500/20 rounded-2xl">
                            <Play size={20} className="text-cyan-400 fill-cyan-400" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-cyan-400/80 text-xs font-semibold uppercase tracking-widest mb-1">Reproducciones Totales</h3>
                        <p className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                            {tracks.reduce((acc, t) => acc + (t.plays || 0), 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="tracks-list glass-premium rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.02]"
            >
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.03] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
                    <div>
                        <h2 className="font-black text-lg tracking-tight text-white/90">Gestión de Catálogo</h2>
                    </div>
                    <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                        <button className="px-4 py-2 rounded-lg text-xs font-bold bg-white/10 text-white shadow-sm transition-all">Publicadas ({myTracks.length})</button>
                        <button className="px-4 py-2 rounded-lg text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all">Borradores</button>
                    </div>
                </div>

                <div className="p-2 md:p-4">
                    {myTracks.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex-center mb-4">
                                <Music size={32} className="text-white/20" />
                            </div>
                            <p className="text-white/60 font-medium text-lg">Tu catálogo está vacío.</p>
                            <p className="text-white/40 text-sm mt-1">Sube tu primera pista para verla aquí.</p>
                        </div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="flex flex-col gap-2"
                        >
                            {/* Header Row para Desktop */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <div className="col-span-5 relative left-2">Pista / Artista</div>
                                <div className="col-span-2 text-center">Motor IA</div>
                                <div className="col-span-1 text-center">Vistas</div>
                                <div className="col-span-2 text-center">Estado</div>
                                <div className="col-span-2 text-right relative right-2">Acciones</div>
                            </div>

                            {myTracks.map((track, idx) => (
                                <motion.div 
                                    variants={itemVariants}
                                    key={track.id} 
                                    className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 sm:p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(var(--accent-page-rgb),0.3)] relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-page)]/0 to-transparent group-hover:via-[var(--accent-page)]/5 transition-all duration-1000 -translate-x-full group-hover:translate-x-full pointer-events-none" />
                                    {/* Pista Info */}
                                    <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg flex items-center justify-center bg-black/50">
                                            {track.cover ? (
                                                <img src={track.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <Music size={16} className="text-white/20" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                            <button
                                                onClick={() => handlePlay(track)}
                                                className="absolute inset-0 flex-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                                            >
                                                <div className="w-8 h-8 bg-cyan-500 rounded-full flex-center shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                                                    <Play size={12} fill="white" className="text-white ml-0.5" />
                                                </div>
                                            </button>
                                        </div>
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <span className="truncate text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{track.title}</span>
                                            <span className="truncate text-[11px] text-white/50 font-medium mt-0.5">{track.artist}</span>
                                        </div>
                                    </div>

                                    {/* Estadísticas móviles (ocultas en escritorio) / Columnas para Desktop */}
                                    <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center mt-2 md:mt-0">
                                        <span className="md:hidden text-xs text-white/40 uppercase">Motor:</span>
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/80 font-bold uppercase tracking-wide">
                                            {(track.ai || 'IA').split(',')[0]}
                                        </span>
                                    </div>

                                    <div className="col-span-1 md:col-span-1 flex justify-between md:justify-center items-center">
                                        <span className="md:hidden text-xs text-white/40 uppercase">Vistas:</span>
                                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md">
                                            <Play size={10} className="text-white/40" />
                                            <span className="text-white font-bold text-xs">{track.plays || 0}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center">
                                        <span className="md:hidden text-xs text-white/40 uppercase">Estado:</span>
                                        <span className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-tight px-3 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                            <ShieldCheck size={14} /> Verificado
                                        </span>
                                    </div>

                                    {/* Acciones */}
                                    <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4 md:mt-0 pt-4 border-t border-white/5 md:border-t-0 md:pt-0">
                                        <button
                                            onClick={() => {
                                                setSelectedTrack(track);
                                                setIsClipMakerOpen(true);
                                            }}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-white/10 hover:border-cyan-500 hover:bg-cyan-500/10 rounded-xl text-xs font-bold uppercase tracking-wide transition-all text-white/70 hover:text-cyan-400"
                                        >
                                            <Video size={14} /> <span className="md:hidden lg:inline">Clip</span>
                                        </button>
                                        
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    if (confirm(`¿Estás seguro de eliminar "${track.title}"? Esta acción es irreversible.`)) {
                                                        deleteTrack(track.id);
                                                    }
                                                }}
                                                className="px-3 py-2 border border-red-500/20 hover:border-red-500 hover:bg-red-500/20 rounded-xl text-red-500 transition-all active:scale-95 bg-black/40"
                                                title="Eliminar pista"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.section>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8 p-6 glass-premium border-l-[6px] border-blue-400 rounded-2xl flex flex-col sm:flex-row gap-4 sm:items-center bg-white/[0.03]"
            >
                <div className="p-3 bg-blue-500/10 rounded-2xl shrink-0 self-start sm:self-auto border border-blue-500/20">
                    <Info className="text-blue-400" size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm mb-1">Aviso de Derechos de Autor IA</h4>
                    <p className="text-sm text-white/50 leading-relaxed max-w-4xl">
                        Asegúrate de poseer los derechos comerciales de las plataformas generativas que utilices.
                        NeuralGrooves está diseñado para integrar etiquetas automáticas según el origen de la creación (Suno, Udio, etc.)
                        para mantener la transparencia algorítmica.
                    </p>
                </div>
            </motion.div>

            {selectedTrack && (
                <ClipMaker
                    isOpen={isClipMakerOpen}
                    onClose={() => setIsClipMakerOpen(false)}
                    trackTitle={selectedTrack.title}
                    trackCover={selectedTrack.cover}
                />
            )}
        </div>
    );
}

