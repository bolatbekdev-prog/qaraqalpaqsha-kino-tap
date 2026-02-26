import React from 'react';
import { Teaser } from '../types';

interface TeaserModalProps {
  teaser: Teaser;
  onClose: () => void;
}

const getYouTubeId = (url: string) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7] && match[7].length === 11 ? match[7] : null;
};

const TeaserModal: React.FC<TeaserModalProps> = ({ teaser, onClose }) => {
  const youtubeId = getYouTubeId(teaser.videoUrl);
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`
    : teaser.videoUrl;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 md:p-8">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-[#0a0b0d] border border-white/10 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h3 className="text-white font-black uppercase tracking-tight">{teaser.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{new Date(teaser.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-plex-red transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="aspect-video bg-black">
          <iframe src={embedUrl} title={teaser.title} className="w-full h-full" frameBorder="0" allowFullScreen />
        </div>
        <div className="p-5 text-sm text-gray-300">{teaser.description}</div>
      </div>
    </div>
  );
};

export default TeaserModal;

