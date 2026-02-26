
import React, { useState, useEffect, Suspense, lazy } from 'react';

const App = lazy(() => import('./App'));

const AppLoader: React.FC = () => {
    const apiKey =
        import.meta.env.VITE_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.API_KEY ||
        "";
    const [isKeyReady, setIsKeyReady] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkApiKey = async () => {
            if (apiKey !== "") {
                setIsKeyReady(true);
                setIsChecking(false);
                return;
            }

            // Eger joq bolsa, AI Studio ortalıǵın tekseremiz
            if ((window as any).aistudio?.hasSelectedApiKey) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (hasKey) {
                    setIsKeyReady(true);
                }
            } else {
                // Eger hesh qanday sheklew joq bolsa (biypul versiya)
                setIsKeyReady(true);
            }
            setIsChecking(false);
        };
        checkApiKey();
    }, [apiKey]);

    const handleSelectKey = async () => {
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
            setIsKeyReady(true);
        } else {
            // Alternativ retinde process.env.API_KEY bar dep esaplaymız
            setIsKeyReady(true);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-plex-red/20 border-t-plex-red rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Kino Tap Júklenbekte</span>
                </div>
            </div>
        );
    }

    if (!isKeyReady) {
        return (
            <div className="min-h-screen bg-[#080809] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.05)_0%,transparent_70%)]"></div>
                <div className="relative w-full max-w-md bg-[#0c0c0e] rounded-[48px] border border-white/5 p-12 text-center shadow-2xl animate-zoomIn">
                    <div className="w-20 h-20 bg-plex-red rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-plex-red/20 transform -rotate-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Gemini AI Gilti</h1>
                    <p className="text-gray-500 text-sm leading-relaxed mb-10 font-medium">
                        Aqıllı AI járdemshisin isletiw ushın API giltin tańlawıńız kerek. Bul sizge qızıqlı kino usınısların beriwge járdem beredi.
                    </p>
                    <button 
                        onClick={handleSelectKey} 
                        className="w-full bg-plex-red hover:bg-white hover:text-plex-red text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-plex-red/20 active:scale-95"
                    >
                        API Giltin Tańlaw
                    </button>
                    <div className="mt-8">
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-plex-red transition-colors">
                            Billing (tólem) haqqında
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-plex-red/20 border-t-plex-red rounded-full animate-spin"></div>
            </div>
        }>
            <App />
        </Suspense>
    );
};

export default AppLoader;
