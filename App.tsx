import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieGrid from './components/MovieGrid';
import MovieModal from './components/MovieModal';
import GeminiAssistant from './components/GeminiAssistant';
import FeedbackSection from './components/FeedbackSection';
import Komanda from './components/Komanda';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ProfileManager from './components/ProfileManager';
import AuthModal from './components/AuthModal';
import TeaserModal from './components/TeaserModal';
import { MOCK_MOVIES, GENRES } from './constants';
import { AppNotification, JobApplication, Movie, TabType, Season, Teaser, User } from './types';
import { onAuthStateChanged, signOut, auth, db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const getSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

const sanitizeUrl = (value: string) => {
  if (!value) return value;
  return value.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
};

const isValidImageUrl = (value: string) => {
  if (!value) return false;
  return /^(https?:\/\/|data:image\/|blob:|\/)/i.test(value);
};

const isValidVideoUrl = (value: string) => {
  if (!value) return false;
  return /^(https?:\/\/|data:video\/|blob:|\/|secure:\/\/movie\/)/i.test(value);
};

const normalizeMovie = (movie: Movie): Movie => ({
  ...movie,
  imageUrl: isValidImageUrl(sanitizeUrl(movie.imageUrl)) ? sanitizeUrl(movie.imageUrl) : 'https://files.catbox.moe/m6dx8r.png',
  videoUrl: isValidVideoUrl(sanitizeUrl(movie.videoUrl)) ? sanitizeUrl(movie.videoUrl) : ''
});

const SHARED_DOC_PATH = ['kinoTapApp', 'sharedState'] as const;

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedTeaser, setSelectedTeaser] = useState<Teaser | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [season] = useState<Season>(getSeason());
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isRemoteReadyRef = useRef(false);
  const isApplyingRemoteRef = useRef(false);
  const sharedDocRef = useRef(doc(db, SHARED_DOC_PATH[0], SHARED_DOC_PATH[1]));
  
  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('kinotap_movies_kaa_v3');
    if (!saved) return MOCK_MOVIES.map(normalizeMovie);
    try {
      const parsed: Movie[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(m => m.id));
      const missingFromSaved = MOCK_MOVIES.filter(m => !existingIds.has(m.id)).map(normalizeMovie);
      return [...parsed.map(normalizeMovie), ...missingFromSaved];
    } catch {
      return MOCK_MOVIES.map(normalizeMovie);
    }
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('kinotap_users');
    if (saved) return JSON.parse(saved);
    // Seed with the primary admin
    return [
      {
        id: 'bolatbekpython',
        name: 'Bolat',
        email: 'bolatbekpython@gmail.com',
        avatar: `https://ui-avatars.com/api/?name=Bolat&background=000000&color=fff`,
        role: 'admin'
      }
    ];
  });

  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('kinotap_templates');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('kinotap_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('kinotap_job_applications_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('kinotap_notifications_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [teasers, setTeasers] = useState<Teaser[]>(() => {
    const saved = localStorage.getItem('kinotap_teasers_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const persistSharedState = async (patch: Record<string, unknown>) => {
    if (!isRemoteReadyRef.current || isApplyingRemoteRef.current) return;
    try {
      await setDoc(
        sharedDocRef.current,
        { ...patch, updatedAt: Date.now() },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to persist shared app state:', err);
    }
  };
  
  useEffect(() => {
    const unsubShared = onSnapshot(
      sharedDocRef.current,
      async (snap) => {
        const data = snap.data() as any;
        if (!data) {
          try {
            await setDoc(
              sharedDocRef.current,
              {
                movies: movies.map(normalizeMovie),
                users,
                templates,
                applications,
                notifications,
                teasers,
                updatedAt: Date.now()
              },
              { merge: true }
            );
          } catch (err) {
            console.error('Failed to seed shared state:', err);
          } finally {
            isRemoteReadyRef.current = true;
          }
          return;
        }

        isApplyingRemoteRef.current = true;
        if (Array.isArray(data.movies)) setMovies(data.movies.map(normalizeMovie));
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.templates)) setTemplates(data.templates);
        if (Array.isArray(data.applications)) setApplications(data.applications);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        if (Array.isArray(data.teasers)) setTeasers(data.teasers);

        isRemoteReadyRef.current = true;
        window.setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 0);
      },
      (err) => {
        console.error('Shared state listener error:', err);
        isRemoteReadyRef.current = true;
      }
    );

    return () => unsubShared();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || '').toLowerCase();
        const adminEmails = ['admin@gmail.com', 'bolatbekpython@gmail.com'];
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Paydalanıwshı',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=random`,
          // Qarama-qarshılıq bolmasın dep AuthProvider bilan bir xil role qoida
          role: adminEmails.includes(email) || email.includes('admin') ? 'admin' : 'user'
        };
        setUser(userData);
        // Ensure signed-in user is globally visible to admin/users via Firestore-backed state.
        setUsers(prev => {
          const existingIndex = prev.findIndex(p => p.email.toLowerCase() === userData.email.toLowerCase());
          let next = prev;
          if (existingIndex === -1) {
            next = [{ id: userData.id, name: userData.name, email: userData.email, avatar: userData.avatar, role: userData.role }, ...prev];
          } else {
            next = prev.map((p, idx) => idx === existingIndex ? { ...p, ...userData } : p);
          }
          void persistSharedState({ users: next });
          return next;
        });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setUsers(prev => {
      const existingIndex = prev.findIndex(p => p.email.toLowerCase() === loggedInUser.email.toLowerCase());
      let next = prev;
      if (existingIndex === -1) {
        next = [loggedInUser, ...prev];
      } else {
        next = prev.map((p, idx) => idx === existingIndex ? { ...p, ...loggedInUser } : p);
      }
      void persistSharedState({ users: next });
      return next;
    });
    setIsAuthModalOpen(false);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setActiveTab('home');
  };

  useEffect(() => {
    localStorage.setItem('kinotap_movies_kaa_v3', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('kinotap_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('kinotap_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('kinotap_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('kinotap_job_applications_v1', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('kinotap_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('kinotap_teasers_v1', JSON.stringify(teasers));
  }, [teasers]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpdateMovie = (updatedMovie: Movie) => {
    setMovies(prev => {
      const next = prev.map(m => m.id === updatedMovie.id ? normalizeMovie(updatedMovie) : m);
      void persistSharedState({ movies: next });
      return next;
    });
  };

  const handleHeroStartWatching = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHeroOpenMyList = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab('favorites');
  };

  const handleSubmitApplication = (payload: Omit<JobApplication, 'id' | 'status' | 'adminNote' | 'createdAt' | 'updatedAt'>) => {
    const application: JobApplication = {
      ...payload,
      id: `app_${Date.now()}`,
      status: 'pending',
      adminNote: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setApplications(prev => {
      const next = [application, ...prev];
      void persistSharedState({ applications: next });
      return next;
    });
  };

  const createNotification = (payload: { type: AppNotification['type']; title: string; message: string; targetUserId?: string | null }) => {
    const notification: AppNotification = {
      id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      createdAt: Date.now(),
      targetUserId: payload.targetUserId ?? null,
      readBy: []
    };
    setNotifications(prev => {
      const next = [notification, ...prev].slice(0, 200);
      void persistSharedState({ notifications: next });
      return next;
    });
  };

  const handleUpdateApplication = (updatedApplication: JobApplication) => {
    const previous = applications.find(a => a.id === updatedApplication.id);
    setApplications(prev => {
      const next = prev.map(a => a.id === updatedApplication.id ? updatedApplication : a);
      void persistSharedState({ applications: next });
      return next;
    });

    if (previous && previous.status !== updatedApplication.status) {
      const statusTitle =
        updatedApplication.status === 'approved'
          ? 'Komandaga qabıl etildińiz'
          : updatedApplication.status === 'rejected'
            ? 'Arzańız qabıl etilmedi'
            : 'Arzańız qayta kórip shıǵıldı';

      createNotification({
        type: 'application',
        title: statusTitle,
        message: updatedApplication.adminNote || 'Komanda arza statusı jańalandı.',
        targetUserId: updatedApplication.userId
      });
    }
  };

  const viewerId = user?.id || 'guest';
  const visibleNotifications = useMemo(
    () =>
      notifications
        .filter(n => !n.targetUserId || n.targetUserId === viewerId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [notifications, viewerId]
  );

  const handleMarkNotificationRead = (notificationId: string) => {
    setNotifications(prev => {
      const next = prev.map(n => {
        if (n.id !== notificationId) return n;
        if (n.readBy.includes(viewerId)) return n;
        return { ...n, readBy: [...n.readBy, viewerId] };
      });
      void persistSharedState({ notifications: next });
      return next;
    });
  };

  const handleMarkAllNotificationsRead = () => {
    const visibleIds = new Set(visibleNotifications.map(n => n.id));
    setNotifications(prev => {
      const next = prev.map(n => {
        if (!visibleIds.has(n.id)) return n;
        if (n.readBy.includes(viewerId)) return n;
        return { ...n, readBy: [...n.readBy, viewerId] };
      });
      void persistSharedState({ notifications: next });
      return next;
    });
  };

  const handleAddTeaser = (payload: Omit<Teaser, 'id' | 'createdAt'>) => {
    const teaser: Teaser = {
      id: `tez_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
      videoUrl: payload.videoUrl
    };
    setTeasers(prev => {
      const next = [teaser, ...prev];
      void persistSharedState({ teasers: next });
      return next;
    });
    createNotification({
      type: 'teaser',
      title: `Jańa teaser: ${teaser.title}`,
      message: teaser.description || 'Jańa teaser saytta júklenedi.'
    });
  };

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = !selectedGenre || movie.genre.includes(selectedGenre);
      let matchesTab = true;
      if (activeTab === 'favorites') matchesTab = favorites.includes(movie.id);
      return matchesSearch && matchesGenre && matchesTab;
    });
  }, [searchQuery, selectedGenre, activeTab, movies, favorites]);

  const featuredMovies = useMemo(() => movies.slice(0, 12), [movies]);

  return (
    <div className="min-h-screen bg-plex-black text-white flex flex-col relative selection:bg-plex-red selection:text-white">
      <Navbar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        isScrolled={isScrolled} user={user}
        onLogout={handleLogout}
        onLoginClick={() => setIsAuthModalOpen(true)}
        favoritesCount={favorites.length}
        notifications={visibleNotifications}
        notificationViewerId={viewerId}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      <main className="flex-grow pt-0">
        {activeTab === 'admin' && user?.role === 'admin' ? (
          <div className="pt-24">
            <AdminPanel 
              movies={movies} 
              users={users}
              templates={templates}
              applications={applications}
              onAdd={(m) => {
                const next = [normalizeMovie(m), ...movies];
                setMovies(next);
                void persistSharedState({ movies: next });
              }} 
              onUpdate={handleUpdateMovie}
              onDelete={(id) => {
                const next = movies.filter(m => m.id !== id);
                setMovies(next);
                void persistSharedState({ movies: next });
              }}
              onAddUser={(u:any) => {
                const next = [u, ...users];
                setUsers(next);
                void persistSharedState({ users: next });
              }}
              onUpdateUser={(updated:any) => setUsers(prev => {
                const next = prev.map(p => p.id === updated.id ? updated : p);
                void persistSharedState({ users: next });
                return next;
              })}
              onDeleteUser={(id:string) => setUsers(prev => {
                const next = prev.filter(u => u.id !== id);
                void persistSharedState({ users: next });
                return next;
              })}
              onSaveTemplate={(t:any) => setTemplates(prev => {
                const exists = prev.some((item:any) => item.id === t.id);
                const next = exists ? prev.map((item:any) => item.id === t.id ? t : item) : [t, ...prev];
                void persistSharedState({ templates: next });
                return next;
              })}
              onDeleteTemplate={(id:string) => setTemplates(prev => {
                const next = prev.filter(t => t.id !== id);
                void persistSharedState({ templates: next });
                return next;
              })}
              onUpdateApplication={handleUpdateApplication}
              onPublishNotification={(payload) => createNotification(payload)}
              teasers={teasers}
              onAddTeaser={handleAddTeaser}
              onDeleteTeaser={(id) => setTeasers(prev => {
                const next = prev.filter(t => t.id !== id);
                void persistSharedState({ teasers: next });
                return next;
              })}
            />
          </div>
        ) : activeTab === 'profile' && user ? (
          <div className="pt-24">
            <ProfileManager 
              user={user} 
              onUpdate={(updatedUser) => setUser(updatedUser)} 
              season={season} 
            />
          </div>
        ) : activeTab === 'ai-assistant' ? (
          <div className="pt-24 max-w-[1000px] mx-auto h-[calc(100vh-100px)] pb-8 px-4">
            <GeminiAssistant onSelectMovie={setSelectedMovie} movies={movies} onLoadingChange={setIsAiThinking} />
          </div>
        ) : activeTab === 'team' ? (
          <div className="pt-24 pb-8">
            <Komanda
              user={user}
              onLoginClick={() => setIsAuthModalOpen(true)}
              applications={applications}
              onSubmitApplication={handleSubmitApplication}
            />
          </div>
        ) : activeTab === 'feedback' ? (
          <div className="pt-24 pb-8">
            <FeedbackSection user={user} onLoginClick={() => setIsAuthModalOpen(true)} />
          </div>
        ) : (
          // If user is not authenticated, show only the home Hero animation and a small login CTA
          !user ? (
            <div className="pt-24">
              {/* Always show the Hero animation for anonymous users */}
              <Hero movies={movies} onStartWatching={handleHeroStartWatching} onOpenMyList={handleHeroOpenMyList} />

              <div ref={contentRef} className="mt-8 flex items-center justify-center">
                <div className="w-full max-w-md px-4">
                  <div className="bg-[#0c0c0e] rounded-2xl border border-white/5 p-6 text-center shadow-lg">
                    <p className="text-gray-400 mb-4">To'liq kontentni ko'rish uchun tizimga kiring.</p>
                    <button onClick={() => setIsAuthModalOpen(true)} className="bg-plex-red text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-plex-red transition-all">Kiriw / Ro'yxatdan o'tish</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {activeTab === 'home' && searchQuery === '' && !selectedGenre && (
                <Hero movies={movies} onStartWatching={handleHeroStartWatching} onOpenMyList={handleHeroOpenMyList} />
              )}

              <div ref={contentRef} className={`max-w-[1700px] mx-auto px-4 md:px-8 py-4 ${activeTab !== 'home' || selectedGenre || searchQuery ? 'pt-28' : '-mt-48 relative z-20'}`}>
                <div className="mb-8 relative z-30">
                  <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {GENRES.map(genre => (
                      <button 
                        key={genre.id} 
                        onClick={() => setSelectedGenre(genre.label === selectedGenre ? null : genre.label)} 
                        className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border ${selectedGenre === genre.label ? 'bg-plex-red border-plex-red text-white shadow-lg shadow-plex-red/30' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
                      >
                        {genre.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {activeTab === 'home' && searchQuery === '' && !selectedGenre && (
                  <div className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="w-2 h-8 bg-plex-red rounded-full"></span>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Qaraqalpaqsha filmler</h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                      {featuredMovies.filter(m => m.isQaraqalpaq).map(movie => (
                        <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="flex-shrink-0 w-[320px] group cursor-pointer">
                          <div className="relative aspect-video rounded-[28px] overflow-hidden border border-white/10 bg-[#151515]">
                            <img src={movie.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={movie.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          </div>
                          <div className="mt-4 px-2"><h3 className="text-[15px] font-black text-white uppercase truncate group-hover:text-plex-red transition-colors">{movie.title}</h3></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'home' && searchQuery === '' && !selectedGenre && teasers.length > 0 && (
                  <div className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="w-2 h-8 bg-plex-red rounded-full"></span>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Jańa Teaserler</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {teasers.slice(0, 6).map(teaser => (
                        <button
                          key={teaser.id}
                          type="button"
                          onClick={() => setSelectedTeaser(teaser)}
                          className="text-left bg-[#0b0b0d] border border-white/10 rounded-2xl overflow-hidden hover:border-plex-red/40 transition-colors"
                        >
                          <div className="aspect-video bg-black">
                            <img src={teaser.imageUrl || 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'} alt={teaser.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <p className="text-white font-black uppercase text-sm">{teaser.title}</p>
                            <p className="text-gray-400 text-xs mt-2 line-clamp-2">{teaser.description || 'Teaserdi ashıp kóriń'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}


                <MovieGrid 
                  movies={filteredMovies} 
                  onMovieClick={setSelectedMovie} 
                  favorites={favorites} 
                  onToggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])} 
                />
              </div>
            </div>
          )
        )}
      </main>

      <Footer />
      {selectedMovie && <MovieModal movie={selectedMovie} user={user} onClose={() => setSelectedMovie(null)} isFavorite={favorites.includes(selectedMovie.id)} onToggleFavorite={() => setFavorites(prev => prev.includes(selectedMovie.id) ? prev.filter(f => f !== selectedMovie.id) : [...prev, selectedMovie.id])} />}
      {selectedTeaser && <TeaserModal teaser={selectedTeaser} onClose={() => setSelectedTeaser(null)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} season={season} />}
    </div>
  );
};

export default App;
