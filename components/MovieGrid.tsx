
import React from 'react';
import { Movie } from '../types';

interface MovieGridProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  favorites?: number[];
  onToggleFavorite?: (id: number) => void;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, onMovieClick, favorites = [], onToggleFavorite }) => {
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white/[0.01] rounded-[20px] border border-white/5">
        <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.2em]">Film tabılmadı</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-10 gap-x-3 gap-y-6">
      {movies.map((movie) => {
        return (
          <div key={movie.id} className="group relative">
            <div 
              className="relative aspect-[2/3] overflow-hidden rounded-[14px] bg-[#1a1a1a] border border-white/10 shadow-md group-hover:shadow-[0_20px_50px_rgba(229,9,20,0.45)] transition-all duration-700 group-hover:-translate-y-2.5 cursor-pointer ring-1 ring-white/5"
              onClick={() => onMovieClick(movie)}
            >
              <img 
                src={movie.imageUrl} 
                className="poster-img absolute inset-0 w-full h-full transition-transform duration-[2.5s] group-hover:scale-115"
                alt={movie.title}
                loading="lazy"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = movie.imageUrl.replace('hq720', 'hqdefault');
                }}
              />
              
              {/* Premium Backlit Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Bottom Contrast Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70"></div>
              
              <div className="absolute top-2 right-2 pointer-events-none z-10">
                <div className="bg-black/80 backdrop-blur-2xl px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10 shadow-2xl">
                  <span className="text-yellow-500 text-[10px]">★</span>
                  <span className="text-white text-[10px] font-black">{movie.rating}</span>
                </div>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-none z-10">
                {movie.isQaraqalpaq && (
                  <div className="bg-white/10 backdrop-blur-xl px-2 py-1 rounded-md border border-white/20">
                    <span className="text-[7px] font-black text-white uppercase tracking-tighter drop-shadow-md">MILLIY</span>
                  </div>
                )}
                <div className="bg-plex-red px-2 py-1 rounded-md shadow-[0_0_15px_rgba(229,9,20,0.4)] border border-white/20">
                  <span className="text-[7px] font-black text-white uppercase tracking-tighter drop-shadow-md">{movie.quality}</span>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/30 backdrop-brightness-75 z-20">
                 <div className="w-11 h-11 rounded-full bg-plex-red text-white flex items-center justify-center shadow-[0_0_40px_rgba(229,9,20,0.8)] border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-500">
                    <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                 </div>
              </div>
            </div>
            
            <div className="mt-3 px-0.5 cursor-pointer" onClick={() => onMovieClick(movie)}>
              <h3 className="text-[11px] font-black text-white group-hover:text-plex-red transition-all truncate uppercase tracking-tight leading-tight">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] text-gray-400 font-black">{movie.year}</span>
                <span className="text-[9px] text-gray-800">•</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase truncate">{movie.genre[0]}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MovieGrid;
