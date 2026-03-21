import './globals.css';
import type { Metadata } from 'next';
import LayoutContent from '@/components/LayoutContent';

export const metadata: Metadata = {
    title: 'NeuralGrooves | Tu Estudio de Música IA',
    description: 'La comunidad global para música generada por IA. Descubre, crea y comparte.',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
    manifest: '/manifest.json',
};

import { MusicProvider } from '@/context/MusicContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <MusicProvider>
                    <LayoutContent>{children}</LayoutContent>
                </MusicProvider>
            </body>
        </html>
    );
}
