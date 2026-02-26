
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from '../types.ts';

interface GeminiAssistantProps {
  onSelectMovie: (movie: Movie) => void;
  movies: Movie[];
  compact?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedMovies?: number[];
  type?: string;
}

const OUT_OF_SCOPE_REPLY = "Men Kino TAP platformasınıń AI járdemshisimen. Kino, serial, janr, aktyorlar hám usınıslar boyınsha soraw berseńiz, men sizge járdem beremen.";

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ onSelectMovie, movies, compact = false, onLoadingChange }) => {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    '';
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome',
      role: 'assistant', 
      content: "Assalamu alaykum! Men Kino TAP aqıllı járdemshisimen. Sizge qanday film kerek? Aktyorlar, rejissyorlar yamasa janrlar boyınsha sorasańız boladı." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  const ai = useMemo(() => {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, [apiKey]);

  const movieCatalogContext = useMemo(
    () =>
      movies
        .map((m) => `${m.id}|${m.title}|${m.genre.join('/')}`)
        .join('\n'),
    [movies]
  );

  const isInScopeQuestion = (question: string) => {
    const q = question.toLowerCase();
    const scopeKeywords = /(kino|film|serial|multfilm|aktor|aktyor|rejiss|janr|komediya|drama|horror|rating|imdb|k[oó]'?riw|izlew|usınıs|recommend|movie|series|genre|actor|director|kino tap|kinotap|teaser|premyera)/i;
    if (scopeKeywords.test(q)) return true;
    return movies.some((m) => q.includes(m.title.toLowerCase()));
  };

  const parseStructuredResponse = (raw: string) => {
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const jsonCandidate = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

    try {
      const parsed = JSON.parse(jsonCandidate);
      return {
        answer: String(parsed?.answer || '').trim(),
        suggestedMovieIds: Array.isArray(parsed?.suggestedMovieIds) ? parsed.suggestedMovieIds : [],
        recommendationType: String(parsed?.recommendationType || 'text')
      };
    } catch {
      return {
        answer: cleaned,
        suggestedMovieIds: [],
        recommendationType: 'text'
      };
    }
  };

  useEffect(() => {
    const checkApiKey = async () => {
      if (apiKey) {
        setHasApiKey(true);
        return;
      }
      
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, [apiKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) window.clearInterval(typingIntervalRef.current);
    };
  }, []);

  const handleSelectKey = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!ai) {
      setMessages(prev => [...prev, { role: 'assistant', content: "API gilt tabılmadı. Iltimas, API key ornatıń." }]);
      return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: `u_${Date.now()}`, role: 'user', content: userMessage }]);

    if (!isInScopeQuestion(userMessage)) {
      setMessages(prev => [...prev, { id: `a_scope_${Date.now()}`, role: 'assistant', content: OUT_OF_SCOPE_REPLY }]);
      return;
    }

    setIsLoading(true);

    try {
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
      let responseText = "{}";
      let lastError: unknown = null;

      for (const model of models) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: userMessage,
            config: {
              systemInstruction: `Siz "Kino TAP" platformasınıń professional kinoekspertisiz. 
              Kino katalogı:
              ${movieCatalogContext}
              Tek Qaraqalpaq tilinde qısqa, anıq juwap beriń.
              Eger soraw Kino TAP platformasınan tıs bolsa, answer'ge mına matındı qaytarıń:
              "${OUT_OF_SCOPE_REPLY}"
              Hám recommendationType="out_of_scope", suggestedMovieIds=[] bolsin.
              Tek JSON qaytarıń, qosımsha sóz joq.`,
              temperature: 0.3,
              maxOutputTokens: 220,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  answer: { type: Type.STRING },
                  suggestedMovieIds: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  recommendationType: { type: Type.STRING }
                },
                required: ['answer', 'suggestedMovieIds', 'recommendationType']
              }
            }
          });
          responseText = response.text || "{}";
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (lastError && responseText === "{}") {
        throw lastError;
      }

      const cleanText = responseText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
      let data: any = {};
      data = parseStructuredResponse(cleanText);

      const finalText = data.answer || "Sorawıńız boyınsha maǵlıwmat taba almadım.";
      const suggestedMovies = Array.isArray(data.suggestedMovieIds) ? data.suggestedMovieIds.map((id: any) => Number(id)).filter((id: number) => Number.isFinite(id)) : [];
      const msgType = data.recommendationType;
      const isScopeFallback = /here is the json/i.test(finalText) || /^\{/.test(finalText);
      const normalizedText = msgType === 'out_of_scope' || isScopeFallback ? OUT_OF_SCOPE_REPLY : finalText;

      const assistantId = `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', suggestedMovies, type: msgType }]);

      if (typingIntervalRef.current) window.clearInterval(typingIntervalRef.current);
      let i = 0;
      typingIntervalRef.current = window.setInterval(() => {
        i += 3;
        const nextText = normalizedText.slice(0, i);
        setMessages(prev => prev.map((m) => m.id === assistantId ? { ...m, content: nextText } : m));
        if (i >= normalizedText.length) {
          if (typingIntervalRef.current) window.clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      }, 18);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { 
        id: `a_err_${Date.now()}`,
        role: 'assistant', 
        content: "Baylanısta kishkene qátelik júz berdi. Iltimas, bir azdan soń qaytadan urınıp kóriń." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f]/60 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
      <div className="bg-plex-red/10 border-b border-white/5 px-8 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-plex-red rounded-xl flex items-center justify-center font-black">AI</div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">TAP AI ✨</h2>
        </div>
        {!hasApiKey && !apiKey && (
          <button 
            onClick={handleSelectKey}
            className="bg-plex-red text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-plex-red/30 hover:scale-105 transition-transform"
          >
            API Giltin Tańlaw
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-6 p-8 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-6 py-4 ${msg.role === 'user' ? 'bg-plex-red text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
              <p className="text-base font-medium">{msg.content}</p>
              {msg.suggestedMovies && msg.suggestedMovies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  {msg.suggestedMovies.map(id => {
                    const movie = movies.find(m => m.id === id);
                    if (!movie) return null;
                    return (
                      <button key={id} onClick={() => onSelectMovie(movie)} className="w-full text-left p-3 bg-black/40 hover:bg-plex-red/20 rounded-xl transition-all border border-white/5 flex items-center gap-3">
                        <img src={movie.imageUrl} className="w-8 h-12 rounded object-cover" alt="" />
                        <span className="font-bold text-sm truncate">{movie.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-3xl px-6 py-4 bg-white/5 border border-white/10 text-gray-200">
              <p className="text-sm font-semibold text-gray-300 mb-2">AI jazıp atır...</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-plex-red/80 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-plex-red/80 animate-bounce [animation-delay:120ms]" />
                <span className="w-2 h-2 rounded-full bg-plex-red/80 animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-black/40 border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Sorawıńız..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 focus:border-plex-red/50 outline-none text-white disabled:opacity-30"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-plex-red rounded-xl flex items-center justify-center disabled:opacity-30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeWidth={3}/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
