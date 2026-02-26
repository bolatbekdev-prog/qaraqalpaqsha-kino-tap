
import React, { useState } from 'react';
import { QARAQALPAQFILM_LOGO } from '../constants';

const Footer: React.FC = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-black border-t border-gray-900 pt-16 pb-8 mt-12">
      <div className="max-w-[1700px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="h-20 w-[220px] flex items-center">
                {!logoError ? (
                  <img 
                    src={QARAQALPAQFILM_LOGO} 
                    alt="Qaraqalpaqfilm" 
                    className="h-full w-full object-contain scale-[1.08] opacity-95 hover:opacity-100 transition-all duration-500 hover:scale-105 brightness-125 shadow-2xl [image-rendering:-webkit-optimize-contrast]"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="bg-plex-red w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-3xl shadow-lg">Q</div>
                )}
              </div>
            </div>
            <div className="mt-4">
               <span className="text-2xl font-black text-white red-glow uppercase tracking-tighter">KINO <span className="text-plex-red">TAP</span></span>
               <p className="text-gray-500 text-[13px] leading-relaxed mt-4 font-medium italic border-l-2 border-plex-red/30 pl-4">
                Qaraqalpaqstannıń zamanagóy onlayn kinoteatrı. Barlıq premyeralar hám Qaraqalpaqfilm studiyasınıń eń jaqsı filmleri tek bizde.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 text-xs uppercase tracking-[0.3em]">Bólimler</h4>
            <ul className="space-y-3 text-[12px] text-gray-400 font-bold uppercase tracking-wider">
              <li className="hover:text-plex-red cursor-pointer transition-all hover:translate-x-1">Bas bet</li>
              <li className="hover:text-plex-red cursor-pointer transition-all hover:translate-x-1">Filmler</li>
              <li className="hover:text-plex-red cursor-pointer transition-all hover:translate-x-1">Seriallar</li>
              <li className="hover:text-plex-red cursor-pointer transition-all hover:translate-x-1">Multfilmler</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 text-xs uppercase tracking-[0.3em]">Járdem</h4>
            <ul className="space-y-3 text-[12px] text-gray-400 font-bold uppercase tracking-wider">
              <li className="hover:text-plex-red cursor-pointer transition-all hover:translate-x-1">Sıyasatlarmız</li>
              <li className="hover:text-plex-red cursor-pointer transition-all hover:translate-x-1">
                <a href="https://t.me/bolatbekdev" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1">
                  <span className="text-white">Baylanıs</span>
                  <span className="text-[10px] text-plex-red lowercase normal-case italic opacity-80 group hover:opacity-100">frontend programmist: telegram:@bolatbekdev</span>
                </a>
              </li>
              <li className="hover:text-plex-red cursor-pointer transition-all hover:translate-x-1">Reklama</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 text-xs uppercase tracking-[0.3em]">Tarmoqlar</h4>
            <div className="space-y-2 text-[12px] text-gray-400 font-bold">
              <p className="text-[12px] text-gray-300 font-black">Sayt: <a href="https://qaraqalpaqfilm.uz" target="_blank" rel="noopener noreferrer" className="text-plex-red lowercase">qaraqalpaqfilm.uz</a></p>
              <p className="text-[12px] text-gray-300 font-black">YouTube: <span className="text-plex-red">@qaraqalpaqfilmKinostudiyası</span></p>
              <p className="text-[12px] text-gray-300 font-black">Telegram: <a href="https://t.me/qaraqalpaq_film" target="_blank" rel="noopener noreferrer" className="text-plex-red">@qaraqalpaq_film</a></p>
              <p className="text-[12px] text-gray-300 font-black">Instagram: <a href="https://instagram.com/qaraqalpaq.film" target="_blank" rel="noopener noreferrer" className="text-plex-red">qaraqalpaq.film</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 text-[11px] text-gray-600 font-black uppercase tracking-widest">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2024 KINO TAP. Qaraqalpaqfilm studiyası menen birgelikte.</p>
          </div>

          {/* Komanda moved to its own section after the Feedback/"Pikirler" block */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
