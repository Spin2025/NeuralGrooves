'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        throw new Error('Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada o spam.');
                    }
                    throw error;
                }
                onClose();
            } else {
                if (!username.trim()) throw new Error('El nombre de artista es obligatorio');
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,
                        }
                    }
                });
                if (error) throw error;
                // Auto-close on successful signup (Supabase handles session auto-login if email confirm is off)
                // If it is ON, they need to confirm:
                setError('¡Revisa tu correo! Te hemos enviado un enlace de confirmación para activar tu cuenta.');
                setIsLogin(true); // Switch to login mode
            }
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas.' : (err.message || 'Error de autenticación. Verifica tus datos.'));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setPassword('');
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all" onClick={onClose} />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        className="bg-[#0f0a1c] w-full max-w-md rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col relative text-white z-[100001] max-h-[90vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decoración */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 blur-3xl rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

                        <div className="p-8 relative z-10 w-full">
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black tracking-tight mb-2">
                                    {isLogin ? 'Bienvenido a' : 'Únete a'} <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-page)] to-pink-500 glow-text">
                                        NeuralGrooves
                                    </span>
                                </h2>
                                <p className="text-white/60 text-sm mt-2">
                                    {isLogin 
                                        ? 'Inicia sesión para acceder a tu estudio musical gestionado por IA.'
                                        : 'Crea tu cuenta de artista y empieza a publicar tus pistas generadas.'}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-start gap-3 text-red-100">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-1.5 focus-within:text-[var(--accent-page)] transition-colors group">
                                        <label className="text-xs font-bold text-white/70 ml-2 uppercase tracking-wide group-focus-within:text-white">Nombre de Artista</label>
                                        <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-cyan-400">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Tu alias musical..."
                                            className="w-full bg-black/60 border border-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-400 focus:bg-black/80 text-white font-bold transition-all shadow-md focus:shadow-lg placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5 focus-within:text-[var(--accent-page)] transition-colors group">
                                <label className="text-xs font-bold text-white/70 ml-2 uppercase tracking-wide group-focus-within:text-white">Correo Electrónico</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-cyan-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tucorreo@ejemplo.com"
                                        required
                                        className="w-full bg-black/60 border border-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-400 focus:bg-black/80 text-white font-bold transition-all shadow-md focus:shadow-lg placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-[var(--accent-page)] transition-colors group">
                                <label className="text-xs font-bold text-white/70 ml-2 uppercase tracking-wide group-focus-within:text-white">Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-cyan-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full bg-black/60 border border-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-400 focus:bg-black/80 text-white font-bold transition-all shadow-md focus:shadow-lg placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-8 py-5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-2xl font-black text-black text-lg tracking-widest uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                {isLoading ? <Loader2 className="animate-spin text-black" size={24} /> : (isLogin ? 'Entrar al Estudio' : 'Crear Cuenta')}
                            </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-white/50 text-sm">
                                    {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}
                                    <button 
                                        type="button" 
                                        onClick={toggleMode}
                                        className="ml-2 text-white font-bold hover:text-[var(--accent-page)] hover:underline transition-colors"
                                    >
                                        {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return modalContent;
}
