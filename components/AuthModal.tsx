
import React, { useState } from 'react';
import { User } from '../types';
import { auth, googleProvider, signInWithPopup } from '../firebase';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  season: 'winter' | 'spring' | 'summer' | 'autumn';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, season }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [secretCounter, setSecretCounter] = useState(0);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Ninja usılı: Ikonkaǵa 3 ret basqanda admin forması ashıladı 🥷
  const handleSecretClick = () => {
    const newCounter = secretCounter + 1;
    if (newCounter >= 3) {
      setShowAdminForm(!showAdminForm);
      setSecretCounter(0);
      setError(null);
    } else {
      setSecretCounter(newCounter);
      // 2 sekundtan soń sanawshı nolge túsedi
      setTimeout(() => setSecretCounter(0), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData: User = {
        id: user.uid,
        name: user.displayName || 'Google User',
        email: user.email || '',
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`,
        role: user.email?.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user'
      };
      onLogin(userData);
    } catch (err: any) {
      console.error("Google Login Error:", err.code, err.message);
      setError("Sistemaǵa kiriwde qátelik júz berdi.");
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if ((email === 'admin@gmail.com' || email === 'bolatbekpython@gmail.com') && password === '12345admin') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const adminUser: User = {
        id: 'admin-' + email,
        name: 'Bas Admin',
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=e50914&color=fff`,
        role: 'admin'
      };
      onLogin(adminUser);
    } else {
      setTimeout(() => {
        setError("MAǴLUMATLAR QÁTE!");
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/98 backdrop-blur-md animate-fadeIn" onClick={onClose} />
      
      <div className="relative w-full max-w-[440px] bg-[#0a0a0b] rounded-[50px] shadow-[0_0_120px_rgba(229,9,20,0.1)] overflow-hidden animate-zoomIn border border-white/5 py-12 px-10">
        
        {/* Central Icon - Jasırın triger usı jerde */}
        <div className="mb-10 flex justify-center">
          <div 
            onClick={handleSecretClick}
            className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl cursor-pointer transition-all active:scale-90 ${showAdminForm ? 'bg-plex-red shadow-plex-red/30 rotate-12' : 'bg-white shadow-white/10 hover:scale-105'}`}
          >
            {showAdminForm ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            ) : (
              <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            )}
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-3">
            Kino TAP <span className="text-plex-red">Kiriw</span>
          </h2>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
            {showAdminForm ? 'Jasırın kirisiw bölimi 🥷' : 'Gúller hám kinolar álemine xosh kelipsiz'}
          </p>
        </div>

        {!showAdminForm ? (
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-100 text-black py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <div className="w-5 h-5 border-3 border-plex-red/20 border-t-plex-red rounded-full animate-spin"></div> : <span>Google penen kiriw</span>}
          </button>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4 animate-fadeIn">
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-plex-red/50 transition-all text-sm"
              required
            />
            <input 
              type="password" 
              placeholder="Parol"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-plex-red/50 transition-all text-sm"
              required
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-plex-red hover:bg-red-700 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-plex-red/20 active:scale-95"
            >
              {isLoading ? 'TEKSERİLMEKTE...' : 'TAYYIN'}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-6 text-red-500 text-[10px] font-black uppercase text-center animate-shake tracking-widest">
            {error}
          </p>
        )}

        <div className="mt-12 text-center">
          <button onClick={onClose} className="text-[10px] font-black text-gray-800 hover:text-white uppercase tracking-[0.5em] transition-all">
            ARTQA QAYTIW
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
