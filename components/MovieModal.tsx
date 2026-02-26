
import React, { useState, useEffect, useRef } from 'react';
import { Movie, User } from '../types';

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  user?: User | null;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose, isFavorite, onToggleFavorite, user }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [protectionMessage, setProtectionMessage] = useState('');
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState('');
  const [isResolvingStream, setIsResolvingStream] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [resolvedKind, setResolvedKind] = useState<'youtube' | 'video' | 'embed'>('embed');
  const [isBlackout, setIsBlackout] = useState(false);
  const [secureSessionId, setSecureSessionId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const savedReviews = localStorage.getItem(`reviews_${movie.id}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews([
        { id: 1, userName: "Ekspert", rating: 5, comment: "Professional jumıs! Raxmet.", date: "2 kun aldın" }
      ]);
    }
  }, [movie.id]);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : null;
  };

  const youtubeId = getYouTubeId(resolvedVideoUrl);
  const isDirectVideo = resolvedKind === 'video' || (!youtubeId && (resolvedVideoUrl.includes('.mp4') || resolvedVideoUrl.includes('catbox') || resolvedVideoUrl.includes('archive.org')));
  const isOtherEmbed = resolvedKind === 'embed' && !youtubeId && !isDirectVideo;

  useEffect(() => {
    if (!protectionMessage) return;
    const timeout = window.setTimeout(() => setProtectionMessage(''), 1800);
    return () => window.clearTimeout(timeout);
  }, [protectionMessage]);

  useEffect(() => {
    setShowPlayer(false);
    setResolvedVideoUrl('');
    setStreamError('');
    setResolvedKind('embed');
    setIsBlackout(false);
    setSecureSessionId(null);
  }, [movie.id]);

  const parseSecureMovieId = (url: string) => {
    if (!url.startsWith('secure://movie/')) return null;
    const id = url.replace('secure://movie/', '').trim();
    return id || null;
  };

  const detectKindFromUrl = (url: string): 'youtube' | 'video' | 'embed' => {
    const youtube = getYouTubeId(url);
    if (youtube) return 'youtube';
    if (url.includes('.mp4') || url.includes('catbox') || url.includes('archive.org')) return 'video';
    return 'embed';
  };

  const getYouTubeIdFromImageUrl = (url: string) => {
    const match = url.match(/img\.youtube\.com\/vi\/([^/]+)/);
    return match?.[1] || null;
  };

  const buildYouTubeEmbed = (id: string) =>
    `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&fs=0&disablekb=1`;

  const normalizeVideoUrlForFrame = (url: string) => {
    const id = getYouTubeId(url);
    if (id) return buildYouTubeEmbed(id);
    return url;
  };

  const openProtectedPlayer = async () => {
    const secureMovieId = parseSecureMovieId(movie.videoUrl);
    setStreamError('');

    if (!secureMovieId) {
      const kind = detectKindFromUrl(movie.videoUrl);
      setResolvedKind(kind);
      setResolvedVideoUrl(kind === 'youtube' ? normalizeVideoUrlForFrame(movie.videoUrl) : movie.videoUrl);
      setShowPlayer(true);
      return;
    }

    try {
      setIsResolvingStream(true);
      const response = await fetch('/api/stream/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          movieId: secureMovieId,
          uid: user?.id || null
        })
      });

      if (!response.ok) {
        throw new Error('Stream token service failed');
      }

      const data = await response.json();
      const playbackUrl = String(data?.playbackUrl || '');
      if (!playbackUrl) throw new Error('Missing playback URL');

      setResolvedVideoUrl(playbackUrl);
      setResolvedKind(data?.kind === 'youtube' ? 'youtube' : data?.kind === 'video' ? 'video' : 'embed');
      setSecureSessionId(String(data?.sessionId || ''));
      setShowPlayer(true);
    } catch {
      if (secureMovieId) {
        // Fallback: if secure stream server is down, try local site-hosted mp4.
        setResolvedVideoUrl(`/videos/${secureMovieId}.mp4`);
        setResolvedKind('video');
        setShowPlayer(true);
        setStreamError('');
        return;
      }
      const fallbackId = getYouTubeIdFromImageUrl(movie.imageUrl);
      if (fallbackId) {
        setResolvedVideoUrl(buildYouTubeEmbed(fallbackId));
        setResolvedKind('youtube');
        setShowPlayer(true);
        setStreamError('');
      } else {
        setStreamError("Video ashılmadı. Qayta urınıp kóriń.");
      }
    } finally {
      setIsResolvingStream(false);
    }
  };

  useEffect(() => {
    if (!showPlayer || !secureSessionId || !user?.id) return;

    const interval = window.setInterval(() => {
      fetch('/api/stream/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ uid: user.id, sid: secureSessionId })
      }).catch(() => {});
    }, 20000);

    return () => window.clearInterval(interval);
  }, [showPlayer, secureSessionId, user?.id]);

  const releaseSecureSession = () => {
    if (!secureSessionId || !user?.id) return;
    fetch('/api/stream/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      keepalive: true,
      body: JSON.stringify({ uid: user.id, sid: secureSessionId })
    }).catch(() => {});
  };

  useEffect(() => {
    return () => releaseSecureSession();
  }, [secureSessionId, user?.id]);

  const handleCloseModal = () => {
    releaseSecureSession();
    onClose();
  };

  useEffect(() => {
    const triggerBlackout = (message: string) => {
      if (!showPlayer) return;
      videoRef.current?.pause();
      setIsPlaying(false);
      setIsBlackout(true);
      setProtectionMessage(message);
    };

    const preventContextMenu = (e: Event) => e.preventDefault();
    const preventClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      setProtectionMessage("Kóshiriw sheklengen.");
    };
    const preventDrag = (e: DragEvent) => e.preventDefault();
    const preventSelect = (e: Event) => e.preventDefault();

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        triggerBlackout("Qorǵaw: tab almastı, video qora rejimge ótizildi.");
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const macScreenshotCombo = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key);
      const blocked =
        key === 'printscreen' ||
        macScreenshotCombo ||
        (e.ctrlKey && ['s', 'u', 'p', 'c', 'x', 'a'].includes(key)) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c', 's'].includes(key)) ||
        key === 'f12';

      if (!blocked) return;
      e.preventDefault();
      e.stopPropagation();
      if (key === 'printscreen' && navigator.clipboard) {
        navigator.clipboard.writeText('').catch(() => {});
      }
      triggerBlackout("Qorǵaw: skrinshot/record ámeli bayqaldı.");
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventClipboard);
    document.addEventListener('cut', preventClipboard);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('selectstart', preventSelect);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('keydown', handleKeydown, true);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventClipboard);
      document.removeEventListener('cut', preventClipboard);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('keydown', handleKeydown, true);
    };
  }, [showPlayer]);

  const handleResumeAfterBlackout = () => {
    setIsBlackout(false);
    setProtectionMessage("Qorǵaw rejimi alıp taslandı.");
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newReview = { id: Date.now(), userName: "Siz", rating: 5, comment: newComment, date: "Házir" };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${movie.id}`, JSON.stringify(updated));
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10">
      <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl animate-fadeIn" onClick={handleCloseModal} />
      
      <div className="relative w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] bg-[#0a0b0d] md:rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden animate-zoomIn border border-white/5 flex flex-col">
        
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-black/40 backdrop-blur-xl z-[60]">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-white uppercase tracking-tight truncate max-w-xs">{movie.title}</h2>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{movie.year} • {movie.quality}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onToggleFavorite} className={`p-2.5 rounded-xl border transition-all ${isFavorite ? 'bg-plex-red border-plex-red text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
              <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
            <button onClick={handleCloseModal} className="p-2.5 bg-white/5 hover:bg-plex-red rounded-xl text-white transition-all border border-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar bg-black">
          <div className="w-full">
            {showPlayer && resolvedVideoUrl ? (
              <div className="w-full aspect-video bg-black relative">
                {youtubeId || resolvedKind === 'youtube' ? (
                  <iframe src={resolvedVideoUrl} title={movie.title} className="w-full h-full" frameBorder="0" allowFullScreen={false}></iframe>
                ) : isDirectVideo ? (
                  <div className="relative w-full h-full">
                    <video 
                      ref={videoRef} src={resolvedVideoUrl} className="w-full h-full object-contain" 
                      controls autoPlay
                      controlsList="nodownload noplaybackrate noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      onClick={togglePlay}
                      onContextMenu={(e) => e.preventDefault()}
                      onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)} 
                      onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                    />
                  </div>
                ) : (
                  // Other embed types (Vimeo, Dailymotion, generic embed) - render in iframe
                  <iframe src={resolvedVideoUrl} title={movie.title} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                )}

                {protectionMessage && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-lg border border-red-500/40 bg-black/80 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-200">
                    {protectionMessage}
                  </div>
                )}

                {isBlackout && (
                  <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center gap-4 px-6">
                    <p className="text-white text-xs font-black uppercase tracking-widest text-center">
                      Qorǵaw rejimi iske túsirildi
                    </p>
                    <button
                      type="button"
                      onClick={handleResumeAfterBlackout}
                      className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-colors"
                    >
                      Qayta kóriw
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden cursor-pointer group" onClick={openProtectedPlayer}>
                <img src={movie.imageUrl} className="w-full h-full object-cover brightness-[0.5] group-hover:scale-105 transition-transform duration-[3s]" alt="" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-plex-red/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                     <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                {isResolvingStream && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-black uppercase tracking-widest text-white">
                    Video qorǵalǵan kanal arqalı ashılmaqta...
                  </div>
                )}
                {streamError && !isResolvingStream && (
                  <div className="absolute left-1/2 bottom-4 -translate-x-1/2 max-w-[90%] rounded-lg bg-red-900/80 border border-red-400/40 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-red-100 text-center">
                    {streamError}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-10 space-y-12 bg-[#0a0a0c]">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-2/3 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Film haqqında</h3>
                  <p className="text-gray-400 text-lg leading-relaxed italic">"{movie.description}"</p>
                </div>
                
                <div className="pt-10 border-t border-white/5">
                  <h3 className="text-xl font-black text-white uppercase mb-8">Pikirler</h3>
                  <form onSubmit={handleAddReview} className="flex flex-col gap-4 mb-10">
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Film boyınsha pikińiz..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-plex-red/50 min-h-[120px] resize-none" />
                    <button type="submit" className="bg-plex-red text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest self-end shadow-xl shadow-plex-red/20">Jiberiw</button>
                  </form>
                  <div className="space-y-6">
                    {reviews.map(r => (
                      <div key={r.id} className="p-8 bg-white/[0.03] border border-white/5 rounded-[32px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-white font-black text-sm uppercase tracking-tight">{r.userName}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{r.date}</span>
                        </div>
                        <p className="text-gray-400 italic text-base leading-relaxed">"{r.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3 space-y-6">
                 <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-2xl">
                    <div className="text-center mb-8">
                      <span className="text-yellow-500 text-4xl font-black tracking-tighter">★ {movie.rating}</span>
                      <p className="text-[10px] text-gray-500 font-black uppercase mt-1 tracking-widest">IMDb REYTING</p>
                    </div>
                    <div className="space-y-5">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Jılı</span>
                        <span className="text-white font-black">{movie.year}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Sapa</span>
                        <span className="text-plex-red font-black">{movie.quality}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Mámleket</span>
                        <span className="text-white font-black text-right">{movie.country}</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
