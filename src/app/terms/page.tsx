'use client';

import React from 'react';
import { Shield, Scale, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="terms-container p-8 max-w-4xl mx-auto">
            <header className="mb-12 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex-center mx-auto mb-6 text-primary">
                    <Shield size={32} />
                </div>
                <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
                <p className="text-dim">Last updated: March 2026</p>
            </header>

            <section className="glass rounded-[2rem] p-10 space-y-10 border border-white/5">

                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Scale size={20} className="text-secondary" /> 1. Music Ownership & AI Rights
                    </h2>
                    <div className="space-y-3 text-dim text-sm leading-relaxed">
                        <p>
                            By uploading content to NeuralGrooves, you represent and warrant that you hold the necessary commercial rights to the AI-generated music.
                        </p>
                        <div className="p-4 bg-white/5 rounded-xl border-l-4 border-secondary">
                            <p className="font-bold text-white mb-1">Mandatory Engine Compliance:</p>
                            <p>You must adhere to the terms of service of the AI generation engine used (e.g., Suno, Udio, Mubert). For most platforms, commercial rights are only granted to "Pro" or "Paid" subscribers.</p>
                        </div>
                        <p>
                            NeuralGrooves acts as a hosting and discovery platform and does not claim ownership of user-uploaded content.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CheckCircle size={20} className="text-secondary" /> 2. Content Labeling
                    </h2>
                    <p className="text-dim text-sm leading-relaxed">
                        All uploads must be accurately tagged with the specific AI model used. Deliberate mislabeling or claiming AI-generated music as 100% human-made is grounds for immediate account suspension.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText size={20} className="text-secondary" /> 3. Fair Use & Monetization
                    </h2>
                    <p className="text-dim text-sm leading-relaxed">
                        NeuralGrooves Pro users may generate revenue through the platform's upcoming tipping and distribution features, provided their source AI license permits commercial exploitation.
                    </p>
                </div>

            </section>

            <footer className="mt-12 text-center">
                <Link href="/" className="btn-primary inline-flex">Accept & Return Home</Link>
            </footer>

            <style jsx>{`
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-center { text-align: center; }
        .leading-relaxed { line-height: 1.625; }
      `}</style>
        </div>
    );
}
