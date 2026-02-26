import React, { useMemo, useState } from 'react';
import { JobApplication, User } from '../types';

interface TeamApplicationPayload {
  userId: string;
  fullName: string;
  email: string;
  about: string;
  resumeFileName: string;
  resumeMimeType: string;
  resumeDataUrl: string;
}

interface KomandaProps {
  user: User | null;
  onLoginClick: () => void;
  applications: JobApplication[];
  onSubmitApplication: (payload: TeamApplicationPayload) => void;
}

const teamMembers = [
  {
    id: 'bolatbek',
    name: 'Bolatbek Keńesbaev',
    role: 'Frontend Programmist',
    bio: 'Nokis mamleketlik texnika universiteti studenti, Uni Startup Club direktor orinbasari.',
    image: '/assets/bolatbek.jpg',
    fallback: 'B'
  }
];

const Komanda: React.FC<KomandaProps> = ({ user, onLoginClick, applications, onSubmitApplication }) => {
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [about, setAbout] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeMimeType, setResumeMimeType] = useState('');
  const [resumeDataUrl, setResumeDataUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const myApplications = useMemo(
    () =>
      user
        ? applications
            .filter((a) => a.userId === user.id)
            .sort((a, b) => b.createdAt - a.createdAt)
        : [],
    [applications, user]
  );
  const approvedCount = myApplications.filter(a => a.status === 'approved').length;
  const pendingCount = myApplications.filter(a => a.status === 'pending').length;

  const statusLabel = (status: JobApplication['status']) => {
    if (status === 'approved') return 'Jumısqa qabıllandı';
    if (status === 'rejected') return 'Qabıllanbaǵan';
    return 'Kútilmekte';
  };

  const statusClass = (status: JobApplication['status']) => {
    if (status === 'approved') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20';
    if (status === 'rejected') return 'bg-red-500/15 text-red-300 border-red-400/20';
    return 'bg-amber-500/15 text-amber-200 border-amber-400/20';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Rezyume 5MB-dan kishi bolıwı kerek.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setResumeDataUrl((reader.result as string) || '');
      setResumeFileName(file.name);
      setResumeMimeType(file.type || 'application/octet-stream');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginClick();
      return;
    }
    if (!fullName.trim() || !email.trim() || !about.trim() || !resumeDataUrl) {
      alert('Barlıq qatarlardı toltırıń hám rezyumeńizdi júkleń.');
      return;
    }
    setIsSubmitting(true);
    try {
      onSubmitApplication({
        userId: user.id,
        fullName: fullName.trim(),
        email: email.trim(),
        about: about.trim(),
        resumeFileName,
        resumeMimeType,
        resumeDataUrl
      });
      setAbout('');
      setResumeFileName('');
      setResumeMimeType('');
      setResumeDataUrl('');
      alert('Arza jiberildi. Admin kórip juwap beredi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-[1700px] mx-auto px-4 md:px-8 py-12">
      <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(140deg,#111217_0%,#08090c_55%,#050507_100%)] p-7 md:p-10 mb-10">
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-plex-red/25 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8 items-end">
          <div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-plex-red/90">Kino TAP Team</p>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mt-3 leading-none">
              Birge Isleytugın <span className="text-plex-red">Kúshti Komanda</span>
            </h2>
            <p className="text-gray-300 mt-5 max-w-2xl leading-relaxed">
              Kreativ ideya, texnologiya hám milliy kontentti biriktiretugın jas professionallar komandası. Biz benen birge ósiwge tayarsızba?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Aǵzalar</p>
              <p className="text-3xl font-black text-white mt-1">{teamMembers.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Kútiliwde</p>
              <p className="text-3xl font-black text-amber-300 mt-1">{pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl p-4 col-span-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Qabıllanǵan Arzalarım</p>
              <p className="text-3xl font-black text-emerald-300 mt-1">{approvedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-plex-red text-white text-xs font-black flex items-center justify-center">1</span>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Komanda Aǵzaları</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0f] p-6 hover:border-plex-red/50 transition-all duration-500">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-plex-red/20 via-transparent to-transparent" />
              <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white/5 mb-5 flex items-center justify-center border border-white/10 ring-4 ring-white/5">
                  {!imgErrors[member.id] ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      onError={() => setImgErrors((prev) => ({ ...prev, [member.id]: true }))}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-plex-red text-white flex items-center justify-center font-black text-2xl">{member.fallback}</div>
                  )}
                </div>
                <h4 className="text-white font-black text-xl tracking-tight">{member.name}</h4>
                <p className="inline-flex mt-2 text-[10px] px-3 py-1 rounded-full bg-plex-red/20 border border-plex-red/30 text-plex-red font-black uppercase tracking-widest">{member.role}</p>
                <p className="text-gray-300 text-sm mt-4 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-plex-red text-white text-xs font-black flex items-center justify-center">2</span>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Komandaġa Qosılıw</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
          <div className="relative overflow-hidden bg-[#07080a] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-plex-red/20 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-black text-white uppercase">Arza Forması</h4>
                <p className="text-xs text-gray-500 mt-1">Komandaǵa qosılıw ushın maǵlıwmatlardı toltırıń</p>
              </div>
              {!user && (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="bg-plex-red text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Kiriw
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Atıńız"
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-plex-red/50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-plex-red/50"
              />
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Qısqasha ózińiz haqqıńızda jazıń..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-white min-h-[130px] resize-none outline-none focus:border-plex-red/50"
              />
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3">
                <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} className="w-full text-sm text-gray-300" />
                {resumeFileName && <p className="text-xs text-emerald-300 mt-2">{resumeFileName}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-plex-red hover:bg-red-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest disabled:opacity-60 transition-colors shadow-[0_12px_35px_rgba(229,9,20,0.35)]"
              >
                {isSubmitting ? 'Jiberilmekte...' : 'Komandaġa Qosılıw'}
              </button>
            </form>
          </div>

          <div className="bg-[#07080a] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h4 className="text-xl font-black text-white uppercase mb-2">Meniń Arızalarım</h4>
            <p className="text-xs text-gray-500 mb-5">Statusı hám admin juwabın osı jerden kóresiz</p>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {myApplications.length === 0 && (
                <div className="border border-dashed border-white/15 rounded-2xl p-6 text-center">
                  <p className="text-gray-500 text-sm">Hozirshe arıza joq.</p>
                </div>
              )}
              {myApplications.map((application) => (
                <div key={application.id} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">{new Date(application.createdAt).toLocaleString()}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-black border ${statusClass(application.status)}`}>{statusLabel(application.status)}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-3 line-clamp-3">{application.about}</p>
                  <p className="text-xs text-gray-500 mt-2">{application.resumeFileName}</p>
                  {application.adminNote && <p className="text-xs text-plex-red mt-3">Admin: {application.adminNote}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Komanda;
