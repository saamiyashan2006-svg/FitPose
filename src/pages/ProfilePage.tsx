import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User as UserIcon, Pencil, LogOut, Ruler, Weight, Calendar, Heart, Target, Mail, X, Check,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/firestoreService';
import { useToast } from '@/context/ToastContext';
import type { UserProfile } from '@/types';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    db.getProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setDraft(p);
      }
    });
  }, [user]);

  const save = async () => {
    if (!draft) return;
    await db.saveProfile(draft);
    setProfile(draft);
    setEditing(false);
    toast('Profile updated', 'success');
  };

  const handleSignOut = async () => {
    await signOut();
    toast('Signed out', 'success');
    navigate('/');
  };

  if (!profile) return null;

  const fields = [
    { icon: Calendar, label: 'Age', value: `${profile.age} yrs`, key: 'age' },
    { icon: Ruler, label: 'Height', value: `${profile.heightCm} cm`, key: 'heightCm' },
    { icon: Weight, label: 'Weight', value: `${profile.weightKg} kg`, key: 'weightKg' },
    { icon: UserIcon, label: 'Gender', value: profile.gender, key: 'gender' },
    { icon: Heart, label: 'Medical Condition', value: profile.medicalCondition, key: 'medicalCondition' },
    { icon: Target, label: 'Goal', value: profile.goal, key: 'goal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your personal information and goals.</p>
      </div>

      <GlassCard className="overflow-hidden p-0">
        {/* header banner */}
        <div className="relative h-32 bg-gradient-to-r from-brand-500 via-brand-400 to-cyan-400">
          <motion.div className="absolute -bottom-12 left-6 flex items-end gap-4">
            <img
              src={profile.photoURL}
              alt={profile.name}
              className="h-24 w-24 rounded-3xl border-4 border-white object-cover bg-slate-200 dark:border-slate-800"
            />
          </motion.div>
        </div>

        <div className="px-6 pb-6 pt-16">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
              <p className="flex items-center gap-1.5 text-sm text-slate-400">
                <Mail className="h-4 w-4" /> {profile.email}
              </p>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => { setDraft(profile); setEditing(false); }} className="btn-ghost">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button onClick={save} className="btn-primary">
                  <Check className="h-4 w-4" /> Save
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="btn-ghost">
                  <Pencil className="h-4 w-4" /> Edit Profile
                </button>
                <button onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-50 px-5 py-2.5 font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>

          {/* fields */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => (
              <div key={f.key} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <f.icon className="h-4 w-4" /> {f.label}
                </div>
                {editing && f.key !== 'gender' ? (
                  <input
                    value={(draft as any)[f.key]}
                    onChange={(e) => setDraft({ ...draft!, [f.key]: e.target.value })}
                    className="input-field mt-2 py-2 text-sm"
                  />
                ) : editing && f.key === 'gender' ? (
                  <select
                    value={(draft as any)[f.key]}
                    onChange={(e) => setDraft({ ...draft!, [f.key]: e.target.value })}
                    className="input-field mt-2 py-2 text-sm"
                  >
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => <option key={g}>{g}</option>)}
                  </select>
                ) : (
                  <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">{f.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
