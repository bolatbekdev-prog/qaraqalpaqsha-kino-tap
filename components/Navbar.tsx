
import React, { useMemo, useState } from 'react';
import { AppNotification, TabType, User } from '../types';
import { QARAQALPAQFILM_LOGO, QMU_LOGO, UNI_ACADEMY_LOGO } from '../constants';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isScrolled: boolean;
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  favoritesCount?: number;
  notifications?: AppNotification[];
  notificationViewerId?: string;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, setActiveTab, searchQuery, setSearchQuery, isScrolled, user, onLogout, onLoginClick, favoritesCount = 0 
  , notifications = [], notificationViewerId = 'guest', onMarkNotificationRead, onMarkAllNotificationsRead
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = useMemo(() => notifications.filter(n => !n.readBy.includes(notificationViewerId)).length, [notifications, notificationViewerId]);
  const typeLabel = (type: AppNotification['type']) => {
    if (type === 'application') return 'Komanda';
    if (type === 'teaser') return 'Teaser';
    return 'Jańalıq';
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/98 backdrop-blur-2xl border-b border-white/10 py-2.5' : 'bg-transparent py-5'}`}>
      <div className="max-w-[1700px] mx-auto px-4 md:px-10 flex items-center justify-between gap-8">
        
        <div className="flex items-center gap-10">
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => setActiveTab('home')}
          >
            {/* Logo Group Container */}
            <div className="flex items-center gap-3">
              {/* QMU Logo (Left) */}
              <div className="w-12 h-12 bg-white rounded-full p-0.5 shadow-lg border border-white/20 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] group-hover:scale-110">
                <img 
                  src={QMU_LOGO} 
                  alt="QMU" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Central Qaraqalpaqfilm Logo */}
              <div className="relative h-12 flex items-center transition-all duration-500 group-hover:scale-105 filter group-hover:drop-shadow-[0_0_20px_rgba(229,9,20,0.5)]">
                {!logoError ? (
                  <img 
                    src={QARAQALPAQFILM_LOGO} 
                    alt="Qaraqalpaqfilm" 
                    className="h-full w-auto object-contain brightness-125 contrast-125"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="bg-plex-red w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg">Q</div>
                )}
              </div>

              {/* UNI Academy Logo (Right) */}
              <div className="w-12 h-12 bg-white rounded-full p-0.5 shadow-lg border border-white/20 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] group-hover:scale-110">
                <img 
                  src={UNI_ACADEMY_LOGO} 
                  alt="UNI Academy" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="hidden sm:flex flex-col border-l-2 border-white/20 pl-5 h-12 justify-center">
              <span className="text-lg font-black tracking-tighter text-white uppercase leading-none">
                KINO<span className="text-plex-red">TAP</span>
              </span>
              <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.35em] mt-1.5 whitespace-nowrap">Onlayn Portalı</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-8">
            <button onClick={() => setActiveTab('home')} className={`text-[12px] font-black uppercase tracking-[0.14em] transition-all ${activeTab === 'home' ? 'text-plex-red scale-110' : 'text-gray-400 hover:text-white'}`}>Bas bet</button>
            <button onClick={() => setActiveTab('ai-assistant')} className={`text-[12px] font-black uppercase tracking-[0.14em] transition-all ${activeTab === 'ai-assistant' ? 'text-plex-red scale-110' : 'text-gray-400 hover:text-white'}`}>AI Járdemshi</button>
            <button onClick={() => setActiveTab('feedback')} className={`text-[12px] font-black uppercase tracking-[0.14em] transition-all ${activeTab === 'feedback' ? 'text-plex-red scale-110' : 'text-gray-400 hover:text-white'}`}>Pikirler</button>
            <button onClick={() => setActiveTab('team')} className={`text-[12px] font-black uppercase tracking-[0.14em] transition-all ${activeTab === 'team' ? 'text-plex-red scale-110' : 'text-gray-400 hover:text-white'}`}>Komanda</button>
            
            {/* ADMIN PANEL BUTTON - ONLY FOR ADMINS */}
            {user?.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border border-plex-red/30 text-[12px] font-black uppercase tracking-[0.14em] transition-all ${activeTab === 'admin' ? 'bg-plex-red text-white shadow-lg shadow-plex-red/30' : 'text-plex-red hover:bg-plex-red hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Admin Panel
              </button>
            )}
          </div>
        </div>

        <div className="flex-grow max-w-xl mx-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-500 group-focus-within:text-plex-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Film izlew..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-3 text-[14px] focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-plex-red/20 transition-all text-white placeholder:text-gray-700 font-bold shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`relative flex items-center gap-2.5 text-[13px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'favorites' ? 'text-plex-red scale-110' : 'text-gray-400 hover:text-plex-red'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <span className="hidden lg:inline">Dizimim</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-plex-red text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse ring-2 ring-black">
                {favoritesCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              className="relative flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.14em] text-gray-400 hover:text-plex-red transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="hidden lg:inline">Bildiriw</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-plex-red text-white text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-lg ring-2 ring-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-[360px] max-w-[92vw] rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden z-[80]">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-white">Bildiriwler</p>
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                  >
                    Hámmesin oqıldı
                  </button>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-500">Hozirshe bildiriw joq.</p>
                  )}
                  {notifications.map(notification => {
                    const isRead = notification.readBy.includes(notificationViewerId);
                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => onMarkNotificationRead && onMarkNotificationRead(notification.id)}
                        className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${isRead ? 'opacity-70' : 'bg-plex-red/5'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-plex-red">{typeLabel(notification.type)}</span>
                          <span className="text-[10px] text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-white font-bold mt-1">{notification.title}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-plex-red cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-plex-red/20" onClick={() => setActiveTab('profile')}>
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              </div>
              <button onClick={onLogout} className="text-[11px] font-black text-gray-500 hover:text-plex-red uppercase tracking-widest hidden sm:block">Shıǵıw</button>
            </div>
          ) : (
            <button onClick={onLoginClick} className="bg-plex-red text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-white hover:text-plex-red transition-all active:scale-95 shadow-2xl shadow-plex-red/40 ring-1 ring-white/10">Kiriw</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
