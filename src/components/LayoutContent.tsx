"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AudioPlayer from '@/components/AudioPlayer';
import PricingModal from '@/components/PricingModal';
import AuthModal from '@/components/AuthModal';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useMusic } from '@/context/MusicContext';
import { supabase } from '@/lib/supabase';
import { Home, Compass, Layout, Library, Settings, Star, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function LayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin, setIsAdmin, user, isAuthModalOpen, setIsAuthModalOpen } = useMusic();
    const [isPricingOpen, setIsPricingOpen] = useState(false);
    const pathname = usePathname();

    const themeClass = pathname === '/dashboard' ? 'theme-studio' : 'theme-discovery';

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className={`layout ${inter.className} ${themeClass}`}>
            <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <aside className="sidebar glass-premium border-r border-white/5 relative z-20 shadow-[8px_0_30px_rgba(0,0,0,0.5)]">
                <div className="logo h-20 flex items-center mb-12 px-2">
                    <Link href="/" className="gradient-text font-black text-3xl tracking-tighter glow-text hover:scale-105 transition-transform">NeuralGrooves</Link>
                </div>
                <nav className="nav-links flex flex-col gap-3">
                    {[
                        { name: 'Descubrimiento', href: '/', exact: true, icon: '🎵' },
                        { name: 'Mi Estudio', href: '/dashboard', exact: false, icon: '🎙️' },
                        { name: 'Tendencias', href: '/?sort=tendencias', exact: false, icon: '🔥' }
                    ].map((item) => {
                        const isActive = item.exact 
                            ? pathname === '/' && !pathname.includes('sort=tendencias') && typeof window !== 'undefined' && !window.location.search.includes('sort=tendencias')
                            : (item.href === '/?sort=tendencias' ? typeof window !== 'undefined' && window.location.search.includes('sort=tendencias') : pathname === item.href);

                        return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`nav-link px-5 py-3.5 rounded-[1.25rem] transition-all duration-300 flex items-center gap-4 group ${isActive ? 'bg-gradient-to-r from-[var(--accent-page)]/20 to-[var(--accent-page)]/5 text-white border border-[var(--accent-page)]/40 shadow-[0_0_20px_rgba(var(--accent-page-rgb),0.2)] font-bold' : 'text-white/50 hover:text-white hover:bg-white/10 font-semibold'}`}
                        >
                            <span className={`text-xl transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'opacity-70 group-hover:scale-110 group-hover:opacity-100'}`}>{item.icon}</span>
                            <span className="text-[15px] tracking-tight">{item.name}</span>
                        </Link>
                        );
                    })}

                    <button
                        onClick={() => {
                            const key = prompt("Ingrese la Clave Maestra de Administrador:");
                            if (key === 'NeuralAdmin2026') {
                                setIsAdmin(!isAdmin);
                                if (!isAdmin) alert("¡Modo Administrador Activado!");
                            } else if (key !== null) {
                                alert("Clave incorrecta.");
                            }
                        }}
                        className={`flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] transition-all duration-300 border ${isAdmin ? 'bg-gradient-to-r from-[var(--accent-page)]/20 to-transparent text-[var(--accent-page)] border-[var(--accent-page)]/40 shadow-[0_0_20px_rgba(var(--accent-page-rgb),0.3)]' : 'text-white/50 hover:text-white border-transparent hover:bg-white/10'} mt-6`}
                    >
                        <ShieldCheck size={20} className={isAdmin ? 'drop-shadow-[0_0_10px_rgba(var(--accent-page-rgb),0.8)]' : ''} />
                        <span className="font-semibold text-[15px] tracking-tight">{isAdmin ? 'Admin Activo' : 'Acceso Admin'}</span>
                    </button>

                    {/* Auth Section */}
                    {user ? (
                        <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-3">
                             <div className="flex items-center gap-3 px-5 py-2.5 bg-black/20 rounded-[1.25rem] border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-page)] to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(var(--accent-page-rgb),0.4)]">
                                    {user.user_metadata?.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                     <p className="text-sm font-bold truncate text-white uppercase tracking-tight">{user.user_metadata?.username || 'Usuario'}</p>
                                     <p className="text-[11px] text-white/50 truncate w-full block font-medium">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-[1.25rem] transition-all duration-300 text-red-400 hover:text-white hover:bg-red-500/20 group border border-transparent hover:border-red-500/30"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="font-bold text-sm tracking-tight">Cerrar Sesión</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 pt-6 border-t border-white/10">
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-[1.25rem] transition-all duration-300 bg-white/10 hover:bg-white/20 text-white font-bold text-[15px] tracking-tight border border-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                <UserIcon size={18} /> Entrar / Registro
                            </button>
                        </div>
                    )}
                </nav>

                <div className="mt-auto p-6 rounded-[2rem] bg-gradient-to-br from-[var(--accent-page)]/20 via-[var(--accent-page)]/5 to-transparent border border-[var(--accent-page)]/30 relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent-page)]/30 blur-3xl rounded-full group-hover:scale-150 group-hover:bg-[var(--accent-page)]/40 transition-all duration-700" />
                    <p className="text-xs text-[var(--accent-page)] mb-1 uppercase tracking-widest font-black glow-text flex items-center gap-2">
                        <Star size={12} className="fill-[var(--accent-page)]" /> Neural Pro
                    </p>
                    <p className="text-sm text-white/70 mb-5 leading-relaxed font-medium">Libera el potencial completo de tu música IA.</p>
                    <button
                        onClick={() => setIsPricingOpen(true)}
                        className="w-full py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[var(--accent-page)] hover:text-white transition-all shadow-xl"
                    >
                        Pasar a Pro
                    </button>
                </div>
            </aside>
            <main className="content">
                {children}
            </main>
            <footer className="player-bar glass">
                <AudioPlayer />
            </footer>
        </div>
    );
}
