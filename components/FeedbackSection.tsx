
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface FeedbackMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: 'user' | 'admin';
  userAvatar: string;
  message: string;
  timestamp: number;
}

interface FeedbackSectionProps {
  user: User | null;
  onLoginClick: () => void;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ user, onLoginClick }) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('kinotap_feedback_v1');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initial: FeedbackMessage[] = [
        {
          id: '1',
          userId: 'admin_1',
          userName: 'Admin',
          userRole: 'admin',
          userAvatar: 'https://ui-avatars.com/api/?name=Admin&background=e50914&color=fff',
          message: 'Húrmetli paydalanıwshılar! Bul jerde óz pikirlerińizdi hám qanday filmlerdi qosıwımızdı qáleytuǵıńızdı jazsańız boladı.',
          timestamp: Date.now() - 86400000
        }
      ];
      setMessages(initial);
      localStorage.setItem('kinotap_feedback_v1', JSON.stringify(initial));
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginClick();
      return;
    }
    if (!input.trim()) return;

    const newMessage: FeedbackMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      message: input,
      timestamp: Date.now()
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    localStorage.setItem('kinotap_feedback_v1', JSON.stringify(updated));
    setInput('');
  };

  const handleDeleteFeedback = (id: string) => {
    if (window.confirm('Bul xabardı óshiriwdi qálesiz be?')) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      localStorage.setItem('kinotap_feedback_v1', JSON.stringify(updated));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 animate-fadeIn">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
          Pikir hám <span className="text-plex-red">Usınıslar</span>
        </h1>
        <p className="text-gray-500 mt-4 font-medium max-w-lg mx-auto leading-relaxed">
          Platformanı jaqsılaw ushın óz usınıslarıńızdı qaldırıń. Admin barlıq xabarlardı baqlaydı.
        </p>
      </div>

      <div className="glass p-8 rounded-[40px] border border-white/10 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-plex-red/10 blur-3xl rounded-full"></div>
        
        <form onSubmit={handleSend} className="relative z-10 flex flex-col gap-4">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? "Sizdiń pikińiz..." : "Pikir qaldırıw ushın dáslep sistemaǵa kiriń..."}
            className="w-full bg-white/5 border border-white/10 rounded-[28px] px-8 py-6 text-white outline-none focus:border-plex-red/50 focus:bg-white/10 transition-all min-h-[120px] resize-none font-bold"
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              className="bg-plex-red hover:bg-white hover:text-plex-red text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-plex-red/20"
            >
              JIBERIW
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6 pb-20">
        {messages.map(msg => (
          <div key={msg.id} className={`glass p-8 rounded-[36px] border ${msg.userRole === 'admin' ? 'border-plex-red/30 bg-plex-red/5' : 'border-white/5'} transition-all hover:translate-x-2 group`}>
            <div className="flex items-start gap-6">
              <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${msg.userRole === 'admin' ? 'border-plex-red shadow-[0_0_15px_rgba(229,9,20,0.5)]' : 'border-white/10'}`}>
                <img src={msg.userAvatar} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-black text-white text-lg tracking-tight uppercase">{msg.userName}</h4>
                  {msg.userRole === 'admin' && (
                    <span className="bg-plex-red text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest uppercase">ADMIN</span>
                  )}
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-auto">
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </span>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDeleteFeedback(msg.id)} 
                      className="text-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 ml-4"
                      title="Öshiriw"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-300 leading-relaxed font-medium italic">"{msg.message}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackSection;
