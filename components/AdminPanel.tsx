
import React, { useState, useEffect, useRef } from 'react';
import { AppNotification, JobApplication, Movie, Teaser } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
}

interface Template {
  id: string;
  name: string;
  data: Partial<Movie>;
}

interface AdminPanelProps {
  movies: Movie[];
  users?: User[];
  templates?: Template[];
  onAdd: (movie: Movie) => void;
  onUpdate: (movie: Movie) => void;
  onDelete: (id: number) => void;
  onAddUser?: (user: User) => void;
  onUpdateUser?: (user: User) => void;
  onDeleteUser?: (id: string) => void;
  onSaveTemplate?: (t: Template) => void;
  onDeleteTemplate?: (id: string) => void;
  applications?: JobApplication[];
  onUpdateApplication?: (application: JobApplication) => void;
  onPublishNotification?: (payload: { type: AppNotification['type']; title: string; message: string; targetUserId?: string | null }) => void;
  teasers?: Teaser[];
  onAddTeaser?: (payload: Omit<Teaser, 'id' | 'createdAt'>) => void;
  onDeleteTeaser?: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ movies, users = [], templates = [], applications = [], onAdd, onUpdate, onDelete, onAddUser, onUpdateUser, onDeleteUser, onSaveTemplate, onDeleteTemplate, onUpdateApplication, onPublishNotification, teasers = [], onAddTeaser, onDeleteTeaser }) => {
  const [tab, setTab] = useState<'movies'|'users'|'applications'|'notifications'|'teasers'>('movies');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [applicationDrafts, setApplicationDrafts] = useState<Record<string, { status: JobApplication['status']; adminNote: string }>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const templateFileInputRef = useRef<HTMLInputElement | null>(null);
  
  const initialMovieState: Partial<Movie> = {
    title: '', 
    year: 2024, 
    rating: 8.0, 
    quality: 'Full HD', 
    genre: ['Drama'],
    imageUrl: 'https://files.catbox.moe/m6dx8r.png', 
    description: '', 
    duration: '1s 30m',
    country: 'Qaraqalpaqstan', 
    videoUrl: '', 
    isQaraqalpaq: true,
    director: 'Qaraqalpaqfilm', 
    actors: []
  };

  const [newMovie, setNewMovie] = useState<Partial<Movie>>(initialMovieState);
  const [notificationForm, setNotificationForm] = useState({ type: 'news' as AppNotification['type'], title: '', message: '' });
  const [teaserForm, setTeaserForm] = useState({ title: '', description: '', imageUrl: '', videoUrl: '' });

  // Users form state
  const [userForm, setUserForm] = useState<Partial<User>>({ name: '', email: '', role: 'user' });

  useEffect(() => {
    // Reset forms when tab changes
    // Keep movie form data when switching back to movies (needed for template load flow)
    if (tab !== 'movies') {
      setShowForm(false);
      setEditingId(null);
      setNewMovie(initialMovieState);
      setSelectedTemplateId('');
    }
    setUserForm({ name: '', email: '', role: 'user' });
    setNotificationForm({ type: 'news', title: '', message: '' });
    setTeaserForm({ title: '', description: '', imageUrl: '', videoUrl: '' });
  }, [tab]);

  useEffect(() => {
    setApplicationDrafts(prev => {
      const next = { ...prev };
      applications.forEach(app => {
        next[app.id] = next[app.id] || {
          status: app.status,
          adminNote: app.adminNote || ''
        };
      });
      return next;
    });
  }, [applications]);

  const startEdit = (movie: Movie) => {
    setNewMovie(movie);
    setEditingId(movie.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setNewMovie(initialMovieState);
    setEditingId(null);
    setShowForm(false);
    setSelectedTemplateId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovie.title || !newMovie.videoUrl) {
      alert("Atama hám Video siltemesi kerek!");
      return;
    }

    const movieId = editingId || Date.now();
    const moviePayload = { ...newMovie, id: movieId } as Movie;

    if (editingId) {
      onUpdate(moviePayload);
      alert("Film jańalandı!");
    } else {
      onAdd(moviePayload);
      alert("Jańa film qosıldı!");
    }

    cancelEdit();
  };

  const handleSaveTemplate = () => {
    if (!onSaveTemplate) return;
    const name = prompt('Shablon atamasın jazıŋ:') || `Shablon ${templates.length + 1}`;
    const t = { id: 't_' + Date.now(), name, data: newMovie } as Template;
    onSaveTemplate(t);
    alert('Shablon saqlandı');
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;
    setNewMovie({ ...initialMovieState, ...template.data });
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTemplateFilePicker = () => {
    templateFileInputRef.current?.click();
  };

  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type === 'image/png' || file.type === 'image/jpeg' || /\.(png|jpe?g)$/i.test(file.name);
    if (!isImage) {
      alert("Iltimas, tek PNG yamasa JPEG fayl tańlań.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = String(reader.result || '');
      setNewMovie(prev => ({ ...prev, imageUrl: imageDataUrl }));
      setEditingId(null);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert('PNG/JPEG shablon (poster) júklendi.');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return alert('Isim hám Email kerek');
    const u: User = { id: 'u_' + Date.now(), name: userForm.name!, email: userForm.email!, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.name!)}&background=000&color=fff`, role: (userForm.role as 'user'|'admin') };
    onAddUser && onAddUser(u);
    setUserForm({ name: '', email: '', role: 'user' });
  };

  const toggleUserRole = (u: User) => {
    const updated = { ...u, role: u.role === 'admin' ? 'user' : 'admin' };
    onUpdateUser && onUpdateUser(updated);
  };

  const saveApplication = (application: JobApplication) => {
    if (!onUpdateApplication) return;
    const draft = applicationDrafts[application.id];
    if (!draft) return;
    onUpdateApplication({
      ...application,
      status: draft.status,
      adminNote: draft.adminNote.trim(),
      updatedAt: Date.now()
    });
  };

  const publishNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPublishNotification) return;
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      alert('Tema hám xabar kiritıń.');
      return;
    }
    onPublishNotification({
      type: notificationForm.type,
      title: notificationForm.title.trim(),
      message: notificationForm.message.trim(),
      targetUserId: null
    });
    setNotificationForm({ type: 'news', title: '', message: '' });
    alert('Bildiriw jiberildi.');
  };

  const submitTeaser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddTeaser) return;
    if (!teaserForm.title.trim() || !teaserForm.videoUrl.trim()) {
      alert('Teaser ataması hám video URL kerek.');
      return;
    }
    onAddTeaser({
      title: teaserForm.title.trim(),
      description: teaserForm.description.trim(),
      imageUrl: teaserForm.imageUrl.trim(),
      videoUrl: teaserForm.videoUrl.trim()
    });
    setTeaserForm({ title: '', description: '', imageUrl: '', videoUrl: '' });
    alert('Teaser qosıldı.');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Baza <span className="text-plex-red">Basqarıwı</span></h1>
          <p className="text-gray-500 mt-2 font-medium">Admin panel — foydalanuvchilar, kinolar hám shablonlarni basqarıw.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setTab('movies')} className={`px-5 py-2 rounded-xl font-black ${tab==='movies' ? 'bg-plex-red text-white' : 'bg-white/5 text-gray-300'}`}>Movies</button>
          <button onClick={() => setTab('users')} className={`px-5 py-2 rounded-xl font-black ${tab==='users' ? 'bg-plex-red text-white' : 'bg-white/5 text-gray-300'}`}>Users</button>
          <button onClick={() => setTab('applications')} className={`px-5 py-2 rounded-xl font-black ${tab==='applications' ? 'bg-plex-red text-white' : 'bg-white/5 text-gray-300'}`}>Applications</button>
          <button onClick={() => setTab('notifications')} className={`px-5 py-2 rounded-xl font-black ${tab==='notifications' ? 'bg-plex-red text-white' : 'bg-white/5 text-gray-300'}`}>Notifications</button>
          <button onClick={() => setTab('teasers')} className={`px-5 py-2 rounded-xl font-black ${tab==='teasers' ? 'bg-plex-red text-white' : 'bg-white/5 text-gray-300'}`}>Teasers</button>
        </div>
      </div>

      {tab === 'movies' && (
        <>
          <div className="flex justify-between items-center mb-6">
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="bg-plex-red text-white px-10 py-3 rounded-[22px] font-black">Jańa Film Qosıw</button>
            )}
            <div className="flex items-center gap-3">
              {showForm && (
                <button onClick={handleSaveTemplate} className="bg-white/5 text-white px-6 py-2 rounded-xl font-black">Shablon saqlaw</button>
              )}
              {showForm && <button onClick={cancelEdit} className="bg-white/5 text-white px-6 py-2 rounded-xl font-black">Biykar etiw</button>}
              <input
                ref={templateFileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleTemplateFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={openTemplateFilePicker}
                className="bg-white/10 hover:bg-plex-red text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Shablon tańlaw
              </button>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm min-w-[180px]"
              >
                <option value="">Shablon tańlaw</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleApplyTemplate}
                disabled={!selectedTemplateId}
                className="bg-white/10 hover:bg-plex-red disabled:opacity-40 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Kinoga yuklaw
              </button>
            </div>
          </div>

          {showForm && (
            <div className="glass p-12 rounded-[40px] border border-white/10 mb-16 animate-zoomIn relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{editingId ? 'Filmdi Özgertiw' : 'Jańa Film Maǵlıwmatları'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block">Baslı Maǵlıwmatlar</label>
                  <div className="space-y-4">
                    <input type="text" placeholder="Film Ataması" required value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-plex-red/50" />
                    <input type="text" placeholder="Video URL (MP4 yamasa YouTube)" required value={newMovie.videoUrl} onChange={e => setNewMovie({...newMovie, videoUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-plex-red/50" />
                    <input type="text" placeholder="Poster URL (Rásim siltemesi)" value={newMovie.imageUrl} onChange={e => setNewMovie({...newMovie, imageUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-plex-red/50" />
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block">Texnikalıq</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Jıl" value={newMovie.year} onChange={e => setNewMovie({...newMovie, year: parseInt(e.target.value)})} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" />
                    <input type="number" step="0.1" placeholder="IMDb" value={newMovie.rating} onChange={e => setNewMovie({...newMovie, rating: parseFloat(e.target.value)})} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" />
                  </div>
                  <input type="text" placeholder="Uzaqlıǵı (mısal: 1s 45m)" value={newMovie.duration} onChange={e => setNewMovie({...newMovie, duration: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" />
                  <select value={newMovie.quality} onChange={e => setNewMovie({...newMovie, quality: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none">
                    <option value="Full HD">Full HD</option>
                    <option value="4K UHD">4K UHD</option>
                    <option value="HD 720p">HD 720p</option>
                  </select>
                </div>
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block">Mazmunı hám Rollarda</label>
                  <textarea placeholder="Film mazmunı..." required value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium outline-none min-h-[140px] resize-none" />
                  <button type="submit" className="w-full bg-plex-red text-white py-6 rounded-[28px] font-black text-lg uppercase tracking-widest shadow-2xl shadow-plex-red/40 active:scale-95 transition-all">{editingId ? 'ÓZGERTİWLERDİ SAQLAW' : 'BAZAǴA QOSIW'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-8">Film hám Poster</th>
                  <th className="px-10 py-8">Maǵlıwmat</th>
                  <th className="px-10 py-8 text-right">Ameller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {movies.map(movie => (
                  <tr key={movie.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-10 py-6 flex items-center gap-6">
                      <div className="w-16 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={movie.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black uppercase text-base tracking-tight">{movie.title}</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">ID: {movie.id}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-300 text-xs font-black uppercase tracking-widest">{movie.year} • {movie.quality}</span>
                        <span className="text-yellow-500 font-black">★ {movie.rating}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => startEdit(movie)} className="bg-white/5 hover:bg-white hover:text-black px-5 py-2.5 rounded-xl transition-all uppercase font-black text-[10px] tracking-widest border border-white/5">Özgertiw</button>
                        <button onClick={() => { if(window.confirm(`"${movie.title}" filmın óshiriwdi qálesiz be?`)) onDelete(movie.id) }} className="bg-red-500/10 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-red-500 transition-all uppercase font-black text-[10px] tracking-widest border border-red-500/10">Óshiriw</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass rounded-[30px] border border-white/10 overflow-hidden shadow-2xl p-6 mt-8">
            <h3 className="text-xl font-black mb-4">Shablonlar</h3>
            <div className="space-y-3">
              {templates.length === 0 && <p className="text-gray-400">Hozircha shablon joq. Formani toltırıp `Shablon saqlaw` basıń.</p>}
              {templates.map((t) => (
                <div key={t.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="font-black">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.data.title || '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(t.id);
                        setNewMovie({ ...initialMovieState, ...t.data });
                        setEditingId(null);
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-plex-red px-4 py-2 rounded-xl font-black"
                    >
                      Yuklaw
                    </button>
                    <button
                      type="button"
                      onClick={() => { if(window.confirm('Shablonnı óshiriwdi qálesizbe?')) onDeleteTemplate && onDeleteTemplate(t.id); }}
                      className="bg-white/10 px-4 py-2 rounded-xl font-black"
                    >
                      Óshiriw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">Foydalanuwshılar</h2>
            <div className="w-1/3">
              <form onSubmit={handleAddUser} className="flex gap-2">
                <input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="Isim" className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" />
                <input required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="Email" className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" />
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" className="bg-plex-red px-4 py-2 rounded-xl font-black">Qo'sh</button>
              </form>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]"><tr><th className="px-6 py-4">Foydalanuwshi</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Ameller</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]"><td className="px-6 py-4 flex items-center gap-3"><img src={u.avatar} className="w-10 h-10 rounded-md" alt=""/><div><div className="font-black">{u.name}</div></div></td><td className="px-6 py-4">{u.email}</td><td className="px-6 py-4">{u.role}</td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => toggleUserRole(u)} className="bg-white/5 px-3 py-1 rounded-xl font-black">{u.role==='admin'?'Demote':'Promote'}</button><button onClick={() => { if(window.confirm(`"${u.name}" ni óshiriw qálesiz be?`)) onDeleteUser && onDeleteUser(u.id) }} className="bg-red-600 px-3 py-1 rounded-xl text-white font-black">Óshiriw</button></div></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'applications' && (
        <div className="glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">Komandaga Arızalar</h2>
          </div>
          <div className="space-y-4">
            {applications.length === 0 && <p className="text-gray-400">Hozirshe arıza joq.</p>}
            {applications
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((application) => {
                const draft = applicationDrafts[application.id] || { status: application.status, adminNote: application.adminNote || '' };
                return (
                  <div key={application.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-black">{application.fullName}</p>
                        <p className="text-sm text-gray-400">{application.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(application.createdAt).toLocaleString()}</p>
                      </div>
                      <a
                        href={application.resumeDataUrl}
                        download={application.resumeFileName}
                        className="bg-plex-red text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest"
                      >
                        Rezyume Juklew
                      </a>
                    </div>
                    <p className="text-gray-300 mt-4 text-sm leading-relaxed">{application.about}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          setApplicationDrafts((prev) => ({
                            ...prev,
                            [application.id]: {
                              status: e.target.value as JobApplication['status'],
                              adminNote: draft.adminNote
                            }
                          }))
                        }
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="pending">Kutilmekte</option>
                        <option value="approved">Jumisqa qabillandı</option>
                        <option value="rejected">Qabillanbaǵan</option>
                      </select>
                      <button
                        onClick={() => saveApplication(application)}
                        className="bg-white/10 hover:bg-plex-red text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        Status Saqlaw
                      </button>
                    </div>
                    <textarea
                      value={draft.adminNote}
                      onChange={(e) =>
                        setApplicationDrafts((prev) => ({
                          ...prev,
                          [application.id]: {
                            status: draft.status,
                            adminNote: e.target.value
                          }
                        }))
                      }
                      placeholder="Admin izohi..."
                      className="w-full mt-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white min-h-[80px] resize-none"
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">Sayt Bildiriwleri</h2>
          </div>
          <form onSubmit={publishNotification} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={notificationForm.type}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value as AppNotification['type'] }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="news">Jańalıq</option>
              <option value="teaser">Teaser</option>
            </select>
            <input
              value={notificationForm.title}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Tema (mısal: Jańa prem'yera)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <textarea
              value={notificationForm.message}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Bildiriw mazmunı..."
              className="md:col-span-2 min-h-[120px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
            />
            <button type="submit" className="md:col-span-2 bg-plex-red hover:bg-red-600 text-white py-3 rounded-xl font-black uppercase tracking-widest transition-colors">
              Bildiriw Jiberiw
            </button>
          </form>
        </div>
      )}

      {tab === 'teasers' && (
        <div className="glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">Teaser Basqarıwı</h2>
          </div>
          <form onSubmit={submitTeaser} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input
              value={teaserForm.title}
              onChange={(e) => setTeaserForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Teaser ataması"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={teaserForm.videoUrl}
              onChange={(e) => setTeaserForm(prev => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="Teaser video URL (YouTube/Embed)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={teaserForm.imageUrl}
              onChange={(e) => setTeaserForm(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="Poster URL (ixtiyoriy)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={teaserForm.description}
              onChange={(e) => setTeaserForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Qısqa sipatlama"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <button type="submit" className="md:col-span-2 bg-plex-red hover:bg-red-600 text-white py-3 rounded-xl font-black uppercase tracking-widest transition-colors">
              Teaser Qosıw
            </button>
          </form>

          <div className="space-y-3">
            {teasers.length === 0 && <p className="text-gray-500">Hozirshe teaser joq.</p>}
            {teasers
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((teaser) => (
                <div key={teaser.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-black">{teaser.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(teaser.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">{teaser.description || teaser.videoUrl}</p>
                  </div>
                  <button
                    onClick={() => onDeleteTeaser && onDeleteTeaser(teaser.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest"
                  >
                    Óshiriw
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
