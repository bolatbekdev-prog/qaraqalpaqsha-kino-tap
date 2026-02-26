import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MovieGrid from '../components/MovieGrid';
import MovieModal from '../components/MovieModal';
import GeminiAssistant from '../components/GeminiAssistant';
import FeedbackSection from '../components/FeedbackSection';
import Komanda from '../components/Komanda';
import Footer from '../components/Footer';
import AdminPanel from '../components/AdminPanel';
import ProfileManager from '../components/ProfileManager';
import { useAuth } from '../AuthProvider';
import { MOCK_MOVIES, GENRES } from '../constants';
import { JobApplication, Movie, TabType, Season, User } from '../types';
import { signOut, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const getSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

const Home = () => {
  const { user: firebaseUser } = useAuth();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  const navigate = useNavigate();
  const [season] = useState<Season>(getSeason());
  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('kinotap_movies_kaa_v3');
    return saved ? JSON.parse(saved) : MOCK_MOVIES;
  });
  
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('kinotap_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('kinotap_job_applications_v1');
    return saved ? JSON.parse(saved) : [];
  });
  
  const user = localUser || firebaseUser;

  useEffect(() => {
    localStorage.setItem('kinotap_movies_kaa_v3', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('kinotap_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('kinotap_job_applications_v1', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLocalUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const handleUpdateMovie = (updatedMovie: Movie) => {
    setMovies(prev => prev.map(m => m.id === updatedMovie.id ? updatedMovie : m));
  };

  const handleHeroStartWatching = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHeroOpenMyList = () => {
    if (!user) {
      navigate('/login');
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
    setApplications(prev => [application, ...prev]);
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
        onLoginClick={() => navigate('/login')}
        favoritesCount={favorites.length}
      />

      <main className="flex-grow pt-0">
        {activeTab === 'admin' && user?.role === 'admin' ? (
          <div className="pt-24">
            <AdminPanel 
              movies={movies} 
              applications={applications}
              onAdd={(m) => setMovies([m, ...movies])} 
              onUpdate={handleUpdateMovie}
              onDelete={(id) => setMovies(movies.filter(m => m.id !== id))}
              onUpdateApplication={(updatedApplication) => setApplications(prev => prev.map(a => a.id === updatedApplication.id ? updatedApplication : a))}
            />
          </div>
        ) : activeTab === 'profile' && user ? (
          <div className="pt-24">
            <ProfileManager 
              user={user} 
              onUpdate={(updatedUser) => setLocalUser(updatedUser)} 
              season={season} 
            />
          </div>
        ) : activeTab === 'ai-assistant' ? (
          <div className="pt-24 max-w-[1000px] mx-auto h-[calc(100vh-100px)] pb-8 px-4">
            <GeminiAssistant onSelectMovie={setSelectedMovie} movies={movies} onLoadingChange={setIsAiThinking} />
          </div>
        ) : activeTab === 'team' ? (
          <div className="pt-24 pb-8">
            <Komanda user={user} onLoginClick={() => navigate('/login')} applications={applications} onSubmitApplication={handleSubmitApplication} />
          </div>
        ) : activeTab === 'feedback' ? (
          <div className="pt-24 pb-8">
            <FeedbackSection user={user} onLoginClick={() => navigate('/login')} />
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


              <MovieGrid 
                movies={filteredMovies} 
                onMovieClick={setSelectedMovie} 
                favorites={favorites} 
                onToggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])} 
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} isFavorite={favorites.includes(selectedMovie.id)} onToggleFavorite={() => setFavorites(prev => prev.includes(selectedMovie.id) ? prev.filter(f => f !== selectedMovie.id) : [...prev, selectedMovie.id])} />}
    </div>
  );
};

export default Home;
