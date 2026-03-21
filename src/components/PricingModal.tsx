'use client';

import React, { useState } from 'react';
import { Check, Zap, Crown, Star, ShieldCheck, Rocket } from 'lucide-react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex-center bg-black/90 backdrop-blur-md p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Free Plan */}
                <div className="glass-premium p-8 rounded-[2.5rem] border border-white/5 flex flex-col relative overflow-hidden group">
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors" />
                    <div className="mb-8 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-dim bg-white/5 px-3 py-1 rounded-full border border-white/10">Plan Actual</span>
                        <h3 className="text-3xl font-black mt-4 uppercase tracking-tighter">Oyente Libre</h3>
                        <p className="text-dim mt-2 text-sm italic">"Explora el universo de música IA."</p>
                    </div>

                    <div className="text-5xl font-black mb-8 relative z-10">$0 <span className="text-sm text-dim font-normal tracking-normal uppercase">/ mes</span></div>

                    <ul className="space-y-4 mb-10 flex-1 relative z-10">
                        <li className="flex items-center gap-3 text-xs text-dim">
                            <Check size={16} className="text-secondary" /> 3 Subidas de Pistas / mes
                        </li>
                        <li className="flex items-center gap-3 text-xs text-dim">
                            <Check size={16} className="text-secondary" /> 100MB Almacenamiento Total
                        </li>
                        <li className="flex items-center gap-3 text-xs text-dim">
                            <Check size={16} className="text-secondary" /> Streaming MP3 Estándar
                        </li>
                        <li className="flex items-center gap-3 text-xs text-dim">
                            <Check size={16} className="text-secondary" /> Herramientas Básicas de Clip
                        </li>
                    </ul>

                    <button
                        disabled
                        className="w-full py-4 rounded-2xl border border-white/10 text-dim cursor-not-allowed font-black uppercase text-[10px] tracking-widest"
                    >
                        Plan Activo
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="glass-premium p-8 rounded-[2.5rem] border-2 border-[var(--accent-page)] relative overflow-hidden flex flex-col glow-shadow group">
                    <div className="absolute top-6 right-6 p-2 bg-[var(--accent-page)] rounded-full text-white shadow-[0_0_15px_var(--accent-page)]">
                        <Crown size={20} />
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--accent-page)]/20 blur-3xl rounded-full group-hover:bg-[var(--accent-page)]/30 transition-colors" />

                    <div className="mb-8 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-page)] bg-[var(--accent-page)]/10 px-3 py-1 rounded-full border border-[var(--accent-page)]/20">Más Popular</span>
                        <h3 className="text-3xl font-black mt-4 uppercase tracking-tighter glow-text">Neural Pro</h3>
                        <p className="text-dim mt-2 text-sm italic">"Autonomía total para artistas IA."</p>
                    </div>

                    <div className="text-5xl font-black mb-8 relative z-10">$12 <span className="text-sm text-dim font-normal tracking-normal uppercase">/ mes</span></div>

                    <ul className="space-y-4 mb-10 flex-1 relative z-10">
                        <li className="flex items-center gap-3 text-xs">
                            <Zap size={16} className="text-[var(--accent-page)] fill-[var(--accent-page)]" /> **Ilimitado** Subidas de Pistas
                        </li>
                        <li className="flex items-center gap-3 text-xs">
                            <Zap size={16} className="text-[var(--accent-page)] fill-[var(--accent-page)]" /> **Ilimitado** Almacenamiento (HD WAV)
                        </li>
                        <li className="flex items-center gap-3 text-xs">
                            <Zap size={16} className="text-[var(--accent-page)] fill-[var(--accent-page)]" /> Streaming HD Lossless
                        </li>
                        <li className="flex items-center gap-3 text-xs">
                            <Zap size={16} className="text-[var(--accent-page)] fill-[var(--accent-page)]" /> Temas Avanzados de Visualizador
                        </li>
                        <li className="flex items-center gap-3 text-xs">
                            <Zap size={16} className="text-[var(--accent-page)] fill-[var(--accent-page)]" /> Descubrimiento Prioritario CDN
                        </li>
                    </ul>

                    <button
                        onClick={() => alert("Redirigiendo a Pago...")}
                        className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--accent-page)] hover:text-white transition-all shadow-2xl flex-center gap-2"
                    >
                        <Rocket size={18} /> Subir a Pro
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="md:col-span-2 text-dim hover:text-white text-xs font-black uppercase tracking-widest transition flex-center gap-2 mt-4"
                >
                    Tal vez después, seguiré con el Plan Libre
                </button>
            </div>
        </div>
    );
}
