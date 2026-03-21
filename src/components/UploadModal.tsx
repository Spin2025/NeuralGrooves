'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Music, Wand2, CheckCircle2, AlertCircle, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const { addTrack, tracks, user } = useMusic();
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [aiEngine, setAiEngine] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [mounted, setMounted] = useState(false);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    useEffect(() => {
        setMounted(true);
    }, []);

    const resetAndClose = () => {
        setStep(1);
        setFile(null);
        setCoverFile(null);
        setCoverPreview(null);
        setTitle('');
        setArtist('');
        setAiEngine('');
        setPrompt('');
        setIsUploading(false);
        setErrorMessage('');
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFile(null);
            setCoverFile(null);
            setCoverPreview(null);
            setTitle('');
            setArtist('');
            setAiEngine('');
            setPrompt('');
            setIsUploading(false);
            setErrorMessage('');
            setDirection(1);
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const nextStep = () => {
        setDirection(1);
        setStep(step + 1);
    }
    const prevStep = () => {
        setDirection(-1);
        setStep(step - 1);
    }

    const handleUpload = async () => {
        if (!file || !title || !artist || !aiEngine) return;
        setIsUploading(true);
        setErrorMessage('');

        const isDuplicate = tracks.some(t =>
            (t.title || '').toLowerCase().trim() === title.toLowerCase().trim() &&
            (t.artist || '').toLowerCase().trim() === artist.toLowerCase().trim()
        );

        if (isDuplicate) {
            setErrorMessage("Esta canción ya existe en el sistema.");
            setIsUploading(false);
            return;
        }

        try {
            const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            let audioUrl = '';
            let coverUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&h=600&fit=crop';

            if (!isConfigured) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                audioUrl = URL.createObjectURL(file);
                if (coverFile) coverUrl = URL.createObjectURL(coverFile);
            } else {
                const audioExt = file.name.split('.').pop();
                const audioName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${audioExt}`;

                const { error: audioError } = await supabase.storage
                    .from('audio')
                    .upload(audioName, file);
                if (audioError) throw audioError;

                const { data: { publicUrl: aUrl } } = supabase.storage
                    .from('audio')
                    .getPublicUrl(audioName);
                audioUrl = aUrl;

                if (coverFile) {
                    const coverExt = coverFile.name.split('.').pop();
                    const coverName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;

                    const { error: coverError } = await supabase.storage
                        .from('covers')
                        .upload(coverName, coverFile);
                    if (!coverError) {
                        const { data: { publicUrl: cUrl } } = supabase.storage
                            .from('covers')
                            .getPublicUrl(coverName);
                        coverUrl = cUrl;
                    }
                }

                const { error: dbError } = await supabase
                    .from('tracks')
                    .insert([
                        {
                            title,
                            artist: artist,
                            ai_engine: aiEngine,
                            genre: 'AI Generated',
                            audio_url: audioUrl,
                            cover_url: coverUrl,
                            user_id: user?.id || null
                        }
                    ]);

                if (dbError) throw dbError;
            }

            addTrack({
                id: Date.now().toString(),
                title,
                artist: artist,
                ai: aiEngine,
                genre: 'AI Generated',
                cover: coverUrl,
                audioUrl: audioUrl,
                status: 'Ready',
                plays: 0
            });

            setIsUploading(false);
            nextStep();
        } catch (error: any) {
            console.error("Upload failed:", error);
            setErrorMessage(error.message || "Error al subir la pista. Por favor, inténtalo de nuevo.");
            setIsUploading(false);
        }
    };

    const variants = {
        enter: (direction: number) => {
            return {
                x: direction > 0 ? 100 : -100,
                opacity: 0
            };
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => {
            return {
                zIndex: 0,
                x: direction < 0 ? -100 : 100,
                opacity: 0
            };
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all" onClick={resetAndClose} />
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-black w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] border-4 border-white/30 flex flex-col max-h-[90vh] relative text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#150e28] shrink-0 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-2xl flex-center border border-white/5 shadow-inner">
                                    <Wand2 size={22} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-white/90">Nuevo Lanzamiento</h2>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= i ? 'bg-cyan-500' : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={resetAndClose} className="w-10 h-10 flex border-none items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Contenido principal con Scroll */}
                        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative z-10 min-h-[400px]">
                            <AnimatePresence custom={direction} mode="wait">
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                    className="p-6 md:p-8 w-full h-full"
                                >
                                    {step === 1 && (
                                        <div className="space-y-8">
                                            <div className="text-center space-y-2 mb-8">
                                                <h3 className="text-2xl font-bold text-white tracking-tight">Archivos Multimedia</h3>
                                                <p className="text-sm text-white/50 font-medium">Sube el audio y una portada increíble para tu pista.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* SUBIR AUDIO */}
                                                <div
                                                    className={`rounded-[2.5rem] p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group border-4 ${file ? 'border-cyan-400 bg-[#0f0a1c] shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500 hover:border-cyan-300 shadow-[0_10px_40px_rgba(6,182,212,0.2)] active:scale-95'}`}
                                                    onClick={() => document.getElementById('audio-input')?.click()}
                                                >
                                                    <div className={`w-24 h-24 flex items-center justify-center rounded-full mb-6 transition-all duration-500 ${file ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'bg-cyan-400 text-black shadow-xl group-hover:scale-110 group-hover:bg-white'}`}>
                                                        {file ? <CheckCircle2 size={48} /> : <Upload size={48} />}
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className={`font-black text-2xl mb-2 tracking-tight ${file ? 'text-white' : 'text-cyan-300 group-hover:text-black'}`}>
                                                            {file ? "¡AUDIO LISTO!" : "HAZ CLICK AQUÍ"}
                                                        </h4>
                                                        <p className={`font-bold text-sm px-4 truncate w-[240px] ${file ? 'text-cyan-400' : 'text-white/70 group-hover:text-black/80'}`}>
                                                            {file ? file.name : "Para subir tu archivo MP3"}
                                                        </p>
                                                    </div>
                                                    <input type="file" className="hidden" id="audio-input" accept="audio/*" onChange={handleFileChange} />
                                                </div>

                                                {/* SUBIR CARÁTULA */}
                                                <div
                                                    className={`rounded-[2.5rem] p-4 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group overflow-hidden relative border-4 ${coverFile ? 'border-purple-400 bg-[#0f0a1c] shadow-[0_0_40px_rgba(168,85,247,0.3)]' : 'border-purple-400 bg-purple-500/20 hover:bg-purple-500 hover:border-purple-300 shadow-[0_10px_40px_rgba(168,85,247,0.2)] active:scale-95'}`}
                                                    onClick={() => document.getElementById('cover-input')?.click()}
                                                    style={{ minHeight: '160px' }}
                                                >
                                                    {coverPreview ? (
                                                        <div className="absolute inset-0 z-0">
                                                            <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm" style={{ backgroundImage: `url(${coverPreview})` }} />
                                                            <div className="absolute inset-0 bg-black/40" />
                                                        </div>
                                                    ) : null}

                                                    {coverFile ? (
                                                        <div className="w-24 h-24 rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-110 z-10 overflow-hidden relative border-4 border-white">
                                                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverPreview})` }} />
                                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Upload size={24} className="text-white mb-1" />
                                                                <span className="text-white font-bold text-[10px]">Cambiar</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                                            <div className="w-16 h-16 flex items-center justify-center rounded-full mb-2 transition-all duration-500 bg-purple-400 text-black shadow-xl group-hover:scale-110 group-hover:bg-white">
                                                                <ImageIcon size={32} />
                                                            </div>
                                                            <div className="text-center">
                                                                <h4 className="font-black text-xl mb-1 tracking-tight text-white group-hover:text-black">
                                                                    PORTADA AQUÍ
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <input type="file" className="hidden" id="cover-input" accept="image/*" onChange={handleCoverChange} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="flex flex-col gap-6 relative max-w-lg mx-auto">
                                            <div className="text-center space-y-2 mb-4">
                                                <h3 className="text-2xl font-bold text-white tracking-tight">Identidad Musical</h3>
                                                <p className="text-sm text-white/50 font-medium">Atribuye el crédito correctamente y define tu obra.</p>
                                            </div>

                                            <div className="space-y-4 w-full">
                                                <div className="space-y-1.5 focus-within:text-cyan-400 transition-colors">
                                                    <label className="text-sm font-black text-white ml-2 uppercase tracking-wide">Título de la Canción</label>
                                                    <input
                                                        type="text"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        placeholder="Ej: Caminos de Neón..."
                                                        autoComplete="off"
                                                        spellCheck="false"
                                                        className="w-full bg-white border-4 border-white rounded-[1.5rem] px-6 py-5 outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.8)] text-black text-lg font-black placeholder:text-gray-400 transition-all shadow-xl"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-white ml-2 uppercase tracking-wide">Artista / Autor</label>
                                                    <input
                                                        type="text"
                                                        value={artist}
                                                        onChange={(e) => setArtist(e.target.value)}
                                                        placeholder="Tu nombre artístico..."
                                                        autoComplete="off"
                                                        spellCheck="false"
                                                        className="w-full bg-white border-4 border-white rounded-[1.5rem] px-6 py-5 outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.8)] text-black text-lg font-black placeholder:text-gray-400 transition-all shadow-xl"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-white ml-2 uppercase tracking-wide">Motor Generador IA</label>
                                                    <div className="relative">
                                                        <select
                                                            value={aiEngine}
                                                            onChange={(e) => setAiEngine(e.target.value)}
                                                            className="w-full bg-white border-4 border-white rounded-[1.5rem] px-6 py-5 outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.8)] text-black text-lg font-black appearance-none transition-all cursor-pointer shadow-xl"
                                                        >
                                                            <option value="" disabled className="text-gray-400 font-bold">Seleccionar motor usado...</option>
                                                            <option value="Suno" className="text-black font-bold">Suno V5</option>
                                                            <option value="Udio" className="text-black font-bold">Udio AI</option>
                                                            <option value="TopMediai" className="text-black font-bold">TopMediai</option>
                                                            <option value="Mubert" className="text-black font-bold">Mubert</option>
                                                            <option value="Custom" className="text-black font-bold">Otro Modelo Custom</option>
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-white ml-2 uppercase tracking-wide">Prompt o Estilo (Opcional)</label>
                                                    <textarea
                                                        value={prompt}
                                                        onChange={(e) => setPrompt(e.target.value)}
                                                        placeholder="Describe el estilo musical aquí..."
                                                        autoComplete="off"
                                                        spellCheck="false"
                                                        className="w-full h-32 bg-white border-4 border-white rounded-[1.5rem] px-6 py-5 outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.8)] text-black text-lg font-bold resize-none placeholder:text-gray-400 transition-all shadow-xl custom-scrollbar"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <motion.div 
                                                initial={{ scale: 0 }} 
                                                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                                className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(6,182,212,0.5)] relative"
                                            >
                                                <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/40" />
                                                <CheckCircle2 size={48} className="relative z-10" />
                                            </motion.div>
                                            <motion.h3 
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                                className="text-3xl font-black mb-2 tracking-tight text-white"
                                            >
                                                ¡Pista Publicada!
                                            </motion.h3>
                                            <motion.p 
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                                className="text-white/60 text-base"
                                            >
                                                Tu creación ya forma parte de la biblioteca de Neural Grooves.
                                            </motion.p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer Fijo para Botones */}
                        <div className="px-6 py-5 md:px-8 border-t border-white/10 bg-[#150e28] shrink-0 relative z-10">
                            <AnimatePresence>
                                {errorMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2"
                                    >
                                        <AlertCircle size={16} /> {errorMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-4">
                                {step === 1 ? (
                                    <button
                                        disabled={!file || !coverFile}
                                        onClick={nextStep}
                                        className="w-full py-5 border-none bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-black rounded-full font-black text-lg uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(6,182,212,0.5)] active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Siguiente Paso
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                    </button>
                                ) : step === 2 ? (
                                    <>
                                        <button onClick={prevStep} className="px-8 py-5 border-none rounded-full bg-white/10 text-lg font-black text-white hover:bg-white/20 transition-all active:scale-95 shrink-0 shadow-lg uppercase tracking-widest">
                                            Atrás
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={!title || !artist || !aiEngine || isUploading}
                                            className="flex-1 py-5 border-none bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-black rounded-full font-black text-lg uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(6,182,212,0.5)] active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            {isUploading ? (
                                                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>Publicar Pista <Upload size={22} className="stroke-[3px]" /></>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={resetAndClose} className="w-full flex items-center justify-center gap-3 py-6 border-4 border-black bg-[#9d4edd] text-white hover:bg-[#8338ec] rounded-full font-black text-xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_40px_rgba(157,78,221,0.6)]">
                                        <CheckCircle2 size={28} />
                                        FINALIZAR Y VOLVER AL ESTUDIO
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
