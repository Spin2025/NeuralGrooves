'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Play, Download, Share2, Smartphone, Type, Palette, X } from 'lucide-react';

interface ClipMakerProps {
    isOpen: boolean;
    onClose: () => void;
    trackTitle: string;
    trackCover: string;
}

export default function ClipMaker({ isOpen, onClose, trackTitle, trackCover }: ClipMakerProps) {
    const [clipLength, setClipLength] = useState(15);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [selectedRange, setSelectedRange] = useState({ start: 20, width: 15 }); // % based

    // Mock steady waveform data to avoid hydration mismatch
    const waveformBars = Array.from({ length: 40 }, (_, i) => 30 + Math.abs(Math.sin(i * 0.5) * 50));

    // Canvas animation & Recording logic
    useEffect(() => {
        if (!isOpen) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const w = 1080;
        const h = 1920;

        // Load artwork once
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = trackCover;

        const draw = (time: number) => {
            // Background
            ctx.fillStyle = '#0a0118';
            ctx.fillRect(0, 0, w, h);

            // Animated Gradient Aura
            const auraSize = 600 + Math.sin(time / 500) * 50;
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, auraSize);
            grad.addColorStop(0, 'rgba(157, 78, 221, 0.15)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            if (img.complete) {
                const size = 800;
                const x = (w - size) / 2;
                const y = h * 0.2;

                // Shadow
                ctx.save();
                ctx.shadowBlur = 100;
                ctx.shadowColor = 'rgba(157, 78, 221, 0.5)';
                ctx.drawImage(img, x, y, size, size);
                ctx.restore();

                // Pulsing Waveform below artwork
                const barsCount = 40;
                const barWidth = 15;
                const gap = 8;
                const totalWidth = barsCount * (barWidth + gap);
                const startX = (w - totalWidth) / 2;
                const startY = y + size + 150;

                for (let i = 0; i < barsCount; i++) {
                    const bh = 50 + Math.abs(Math.sin((i / 5) + (time / 200))) * 150;
                    const bx = startX + i * (barWidth + gap);

                    const barGrad = ctx.createLinearGradient(0, startY - bh / 2, 0, startY + bh / 2);
                    barGrad.addColorStop(0, '#9d4edd');
                    barGrad.addColorStop(1, '#00f5d4');

                    ctx.fillStyle = barGrad;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(bx, startY - bh / 2, barWidth, bh, 8);
                    } else {
                        ctx.rect(bx, startY - bh / 2, barWidth, bh);
                    }
                    ctx.fill();
                }

                // Text
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.font = 'bold 64px Outfit';
                ctx.fillText(trackTitle, w / 2, startY + 250);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '40px Outfit';
                ctx.fillText('LISTEN ON NEURALGROOVES', w / 2, startY + 330);

                // Branding
                ctx.fillStyle = '#9d4edd';
                ctx.font = 'bold 48px Outfit';
                ctx.fillText('NEURALGROOVES', w / 2, h - 150);
            }

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [isOpen, trackTitle, trackCover]);

    const startExport = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsGenerating(true);
        setExportProgress(0);

        try {
            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${trackTitle.replace(/\s+/g, '_')}_NeuralGrooves_Clip.webm`;
                a.click();
                setIsGenerating(false);
                setExportProgress(0);
            };

            recorder.start();

            const duration = clipLength * 1000;
            const startTimestamp = Date.now();

            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTimestamp;
                const p = Math.min((elapsed / duration) * 100, 100);
                setExportProgress(p);

                if (elapsed >= duration) {
                    clearInterval(progressInterval);
                    recorder.stop();
                }
            }, 100);
        } catch (e) {
            console.error("Recording failed", e);
            alert("Export failed. Your browser might not support canvas recording.");
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex-center bg-black-80 backdrop-blur-md p-4">
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl h-85vh">

                {/* Preview Side (Mobile View Simulation) */}
                <div className="flex-1 flex flex-col items-center">
                    <p className="text-dim text-xs mb-4 flex items-center gap-2">
                        <Smartphone size={14} /> TIKTOK / REELS PREVIEW (9:16)
                    </p>
                    <div className="relative aspect-9-16 h-full overflow-hidden border-4 border-white-10 rounded-4xl shadow-2xl bg-black">
                        <canvas
                            ref={canvasRef}
                            width={1080}
                            height={1920}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Controls Side */}
                <div className="flex-1 glass rounded-3xl p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Scissors className="text-secondary" /> The Clip Maker
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-dim mb-4 block">Clip Duration</label>
                            <div className="flex gap-4">
                                {[15, 30].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setClipLength(s)}
                                        className={`flex-1 py-3 rounded-xl border transition font-bold cursor-pointer ${clipLength === s ? 'bg-secondary text-black' : 'border-white-10 text-dim hover:border-white/30'}`}
                                        style={clipLength === s ? { borderColor: 'var(--secondary)', backgroundColor: 'var(--secondary)', color: 'black' } : {}}
                                    >
                                        {s} Seconds
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-dim mb-1 block">Select Range</label>
                            <div className="glass h-24 rounded-2xl relative overflow-hidden border border-white/5 p-4 flex items-center">
                                <div className="w-full h-1 bg-white/10 rounded-full relative">
                                    <div className="absolute inset-0 flex items-center justify-around">
                                        {waveformBars.map((h, i) => (
                                            <div key={i} className="w-1 bg-white/20 rounded-full" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                    <div
                                        className="absolute h-10 -top-4"
                                        style={{ left: `${selectedRange.start}%`, width: clipLength === 15 ? '15%' : '30%', backgroundColor: 'rgba(0, 245, 212, 0.3)', borderLeft: '2px solid var(--secondary)', borderRight: '2px solid var(--secondary)' }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-secondary text-black px-1 rounded font-bold">MOVE</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-dim font-mono">
                                <span>0:00</span>
                                <span>Preview Only</span>
                                <span>3:45</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center gap-2 p-4 glass rounded-2xl hover:bg-white/5 transition cursor-not-allowed opacity-50">
                                <Type size={20} className="text-dim" />
                                <span className="text-xs">Captions</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 glass rounded-2xl hover:bg-white/5 transition cursor-not-allowed opacity-50">
                                <Palette size={20} className="text-dim" />
                                <span className="text-xs">Theme</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white-10 mt-auto">
                        {isGenerating && (
                            <div className="mb-4">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-secondary mb-1">
                                    <span>Rendering Clip...</span>
                                    <span>{Math.round(exportProgress)}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary transition" style={{ width: `${exportProgress}%` }} />
                                </div>
                            </div>
                        )}
                        <button
                            onClick={startExport}
                            disabled={isGenerating}
                            className={`btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg ${!isGenerating ? 'pulse-primary' : ''}`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Recording Canvas...
                                </>
                            ) : (
                                <>
                                    <Download size={20} /> Generate & Download Clip
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-dim mt-4 uppercase tracking-widest leading-relaxed">
                            Vertical Full-Screen Clip
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
