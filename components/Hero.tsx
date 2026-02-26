
import React from 'react';
import { Movie } from '../types';

interface HeroProps {
  movies: Movie[];
  onStartWatching?: () => void;
  onOpenMyList?: () => void;
}

const Hero: React.FC<HeroProps> = ({ movies, onStartWatching, onOpenMyList }) => {
  const backgroundMovies = movies.length > 0 ? movies : [];
  
  const ScrollingColumn = ({ direction = 'up', speed = '60s', offset = '0s' }: { direction?: 'up' | 'down', speed?: string, offset?: string }) => {
    const animationClass = direction === 'up' ? 'animate-marquee-up' : 'animate-marquee-down';
    return (
      <div className="flex flex-col gap-4 relative h-full">
        <div className={`flex flex-col gap-4 ${animationClass}`} style={{ animationDuration: speed, animationDelay: offset }}>
          {[...backgroundMovies, ...backgroundMovies, ...backgroundMovies].map((movie, i) => (
            <div key={`${movie.id}-${i}`} className="aspect-[2/3] w-full rounded-[14px] overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
              <img 
                src={movie.imageUrl} 
                className="w-full h-full object-cover opacity-90 transform scale-[1.2] brightness-90 transition-opacity" 
                alt="" 
                loading="lazy" 
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="relative h-[95vh] min-h-[750px] w-full overflow-hidden flex items-center bg-[#0a0a0c]">
      {/* Background Marquee Effects */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none overflow-hidden opacity-25">
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4 w-[140%] h-[150%] transform -rotate-12 -translate-y-20">
          <ScrollingColumn direction="up" speed="110s" offset="0s" />
          <ScrollingColumn direction="down" speed="130s" offset="-10s" />
          <ScrollingColumn direction="up" speed="120s" offset="-20s" />
          <ScrollingColumn direction="down" speed="140s" offset="-30s" />
          <ScrollingColumn direction="up" speed="115s" offset="-15s" />
          <ScrollingColumn direction="down" speed="135s" offset="-25s" />
          <ScrollingColumn direction="up" speed="125s" offset="-5s" />
          <ScrollingColumn direction="down" speed="145s" offset="-35s" />
          <ScrollingColumn direction="up" speed="118s" offset="-12s" />
          <ScrollingColumn direction="down" speed="138s" offset="-22s" />
          <ScrollingColumn direction="up" speed="122s" offset="-8s" />
          <ScrollingColumn direction="down" speed="142s" offset="-18s" />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-[#0a0a0c] opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-[#0a0a0c]/80"></div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0a0a0c] opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 md:px-12 w-full">
        <div className="max-w-6xl space-y-12 animate-fadeIn">
          <div className="space-y-8">
             <div className="flex items-center gap-6">
                <span className="h-[4px] w-16 bg-plex-red rounded-full"></span>
                <span className="text-plex-red font-black text-[14px] md:text-[16px] uppercase tracking-[0.6em] drop-shadow-[0_0_15px_rgba(229,9,20,0.6)]">Milliy Kontent Portalı</span>
             </div>
             
             {/* Kishireytilgen hám turaqlı 1 qatarǵa jaylasqan atama */}
             <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase whitespace-nowrap overflow-hidden text-ellipsis border-white/5 pb-2">
                Kino <span className="text-plex-red drop-shadow-[0_0_30px_rgba(229,9,20,0.6)]">TAP</span>-qa Xosh Kelipsiz!
             </h1>
          </div>
          
          <p className="text-lg md:text-2xl text-gray-200 font-semibold leading-relaxed max-w-4xl italic opacity-95 border-l-[6px] border-plex-red pl-10 py-5 bg-white/[0.03] backdrop-blur-xl rounded-r-3xl shadow-2xl ring-1 ring-white/10">
            Qaraqalpaqstannıń eń úlken hám zamanagóy onlayn kinoteatrı. Jańa premyeralar hám milliy filmler tek bizde.
          </p>

          <div className="flex flex-wrap gap-8 pt-8">
             <button
               type="button"
               onClick={onStartWatching}
               className="group relative bg-plex-red hover:bg-white hover:text-plex-red text-white px-14 py-6 rounded-[24px] font-black text-[16px] transition-all shadow-[0_0_50px_rgba(229,9,20,0.4)] active:scale-95 flex items-center gap-6 uppercase tracking-[0.2em] overflow-hidden"
             >
               <span className="relative z-10">Kóriwdi baslaw</span>
               <svg className="w-6 h-6 relative z-10 transition-transform group-hover:translate-x-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
               <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             </button>
             <button
               type="button"
               onClick={onOpenMyList}
               className="bg-white/5 hover:bg-white/10 border-2 border-white/10 backdrop-blur-3xl text-white px-14 py-6 rounded-[24px] font-black text-[16px] transition-all active:scale-95 uppercase tracking-[0.2em] ring-1 ring-white/5"
             >
               Meniń Dizimim
             </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0f1012] via-[#0f1012]/95 to-transparent"></div>
    </section>
  );
};

export default Hero;
