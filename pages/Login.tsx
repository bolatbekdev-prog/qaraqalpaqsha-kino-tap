
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { auth, googleProvider, signInWithPopup, signInWithPopupAsAdmin } from '../firebase';

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eger paydalanıwshı kiritilgen bolsa, tuwrıdan-tuwrı bas betke jiberiw
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || "/home";
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Navigate useEffect ishinde isleydi
    } catch (err: any) {
      console.error(err);
      setError("Kiriwde qátelik júz berdi. Iltimas, qaytadan urınıp kóriń.");
      setIsLoggingIn(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#080809] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-plex-red/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-plex-red/5 blur-[120px] rounded-full"></div>

      <div className="relative w-full max-w-[460px] bg-[#0c0c0e] rounded-[48px] border border-white/5 p-12 shadow-2xl flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-10 relative">
          <div className="w-20 h-20 bg-plex-red rounded-[28px] flex items-center justify-center shadow-2xl shadow-plex-red/30 transform -rotate-3">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            KINO <span className="text-plex-red">TAP</span> ID
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] opacity-60">
            Professional Milliy Platforma
          </p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full group relative flex items-center justify-center gap-4 bg-white hover:bg-gray-100 text-black py-5 rounded-[22px] font-black text-sm uppercase tracking-wider transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-3 border-plex-red/20 border-t-plex-red rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google penen kiriw</span>
            </>
          )}
        </button>

          {/* Small admin sign-in helper for dev/testing: signs in as admin@gmail.com */}
          <button
            onClick={async () => {
              setIsLoggingIn(true);
              setError(null);
              try {
                await signInWithPopupAsAdmin(auth, googleProvider);
              } catch (err: any) {
                console.error(err);
                setError("Admin kiriwde qátelik. Qaytadan urınıp kóriń.");
                setIsLoggingIn(false);
              }
            }}
            className="mt-4 w-full text-[12px] uppercase tracking-widest font-black bg-black/10 border border-white/5 text-white py-3 rounded-xl hover:bg-black/20 transition-colors"
          >
            Admin bolıp Google arqalı kiriw
          </button>

        {error && (
          <p className="mt-6 text-red-500 text-[10px] font-black uppercase text-center animate-shake">
            {error}
          </p>
        )}

        <div className="mt-12 text-center">
          <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest leading-relaxed">
            Siz sistemaga kiriw arqalı bizdiń <br/>
            <span className="text-gray-500">Paydalanıw shártleri</span>ne razılıq bildiresiz.
          </p>
        </div>
      </div>
    </div>
  );
}
