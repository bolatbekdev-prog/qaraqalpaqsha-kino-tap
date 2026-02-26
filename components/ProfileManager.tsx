
import React, { useState } from 'react';
import { User, Season } from '../types';

interface ProfileManagerProps {
  user: User;
  onUpdate: (user: User) => void;
  season: Season;
}

const PRESET_AVATARS = [
  'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff',
  'https://ui-avatars.com/api/?name=User&background=10b981&color=fff',
  'https://ui-avatars.com/api/?name=User&background=f59e0b&color=fff',
  'https://ui-avatars.com/api/?name=User&background=ef4444&color=fff',
  'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff',
  'https://ui-avatars.com/api/?name=User&background=ec4899&color=fff',
];

const ProfileManager: React.FC<ProfileManagerProps> = ({ user, onUpdate, season }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [customAvatar, setCustomAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getThemeColor = () => {
    switch(season) {
      case 'winter': return 'blue';
      case 'spring': return 'emerald';
      case 'summer': return 'amber';
      case 'autumn': return 'orange';
      default: return 'blue';
    }
  };

  const themeColor = getThemeColor();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({
        ...user,
        name,
        avatar: customAvatar || avatar
      });
      setIsSaving(false);
      alert('Profil maǵlıwmatları jańalandı!');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fadeIn">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
          Meniń <span className={`text-${themeColor}-500`}>Profilim</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Shaxstıy maǵlıwmatlarıńızdı basqarıń hám saqlan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Avatar Selection */}
        <div className="space-y-8">
          <div className="relative group">
            <div className={`absolute -inset-4 bg-${themeColor}-600/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <div className={`relative w-full aspect-square rounded-[40px] overflow-hidden border-4 border-white/10 shadow-2xl bg-black/40 ring-4 ring-${themeColor}-600/20`}>
              <img src={customAvatar || avatar} className="w-full h-full object-cover" alt="Profile" />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Avatar Tańlaw</label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AVATARS.map((src, i) => (
                <button 
                  key={i}
                  onClick={() => { setAvatar(src); setCustomAvatar(''); }}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${avatar === src && !customAvatar ? `border-${themeColor}-500 scale-95 shadow-lg` : 'border-white/5'}`}
                >
                  <img src={src} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="pt-2">
              <input 
                type="text" 
                placeholder="Custom Avatar URL" 
                value={customAvatar}
                onChange={(e) => setCustomAvatar(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[40px] border border-white/10 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Atıńız</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white focus:border-blue-500 transition-all font-bold text-lg" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Email mánzili (Ózgertip bolmaydı)</label>
                <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-gray-500 font-bold opacity-60">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Akkaunt Túri</label>
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${themeColor}-600/10 border border-${themeColor}-500/20 rounded-xl`}>
                  <div className={`w-2 h-2 rounded-full bg-${themeColor}-500 animate-pulse`}></div>
                  <span className={`text-xs font-black text-${themeColor}-500 uppercase tracking-widest`}>{user.role}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-5 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white rounded-[28px] font-black text-lg shadow-2xl shadow-${themeColor}-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50`}
              >
                {isSaving ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    SAQLAW
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[32px] flex items-center justify-between">
            <div>
              <h4 className="text-red-500 font-black text-lg uppercase tracking-tight">Akkauntti Óshiriw</h4>
              <p className="text-red-500/60 text-xs font-medium">Barlıq maǵlıwmatlarıńız turaqlı túrde óshiriledi.</p>
            </div>
            <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl text-xs font-black transition-all">ÓSHIRIW</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;