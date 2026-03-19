'use client';

import { useState } from 'react';
import { User } from '@/modules/auth/types';
import { useTranslation } from '@/providers/LanguageProvider';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user: initialUser }: ProfileFormProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState(initialUser);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, phone: user.phone }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: t('profile.update_success') });
      } else {
        setMessage({ type: 'error', text: data.error || t('common.error') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.connection_error') });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('profile.password_mismatch') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: t('profile.password_success') });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || t('common.error') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.connection_error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {message && (
        <div className={`p-4 rounded-2xl border ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        } text-[13px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2`}>
          {message.text}
        </div>
      )}

      {/* General Information */}
      <section className="card-luxury p-10 border-border-ios/40">
        <h2 className="text-xl font-display font-black mb-8 text-foreground uppercase tracking-widest">{t('profile.general_identity')}</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('profile.label_name')}</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full bg-muted/40 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="Clinic Owner Name"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('profile.label_email')}</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-muted/20 border-border-ios/10 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground-muted cursor-not-allowed opacity-60"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('profile.label_phone')}</label>
              <input
                type="text"
                value={user.phone || ''}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                className="w-full bg-muted/40 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="08X-XXX-XXXX"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="bg-foreground text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-accent hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('profile.update_btn')}
            </button>
          </div>
        </form>
      </section>

      {/* Security */}
      <section className="card-luxury p-10 border-border-ios/40 bg-accent/2">
        <h2 className="text-xl font-display font-black mb-8 text-accent uppercase tracking-widest">{t('profile.security_protocol')}</h2>
        <form onSubmit={handleChangePassword} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('profile.label_current_password')}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white/60 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('profile.label_new_password')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/60 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('profile.label_confirm_password')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/60 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="bg-accent text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:bg-foreground hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('profile.change_password_btn')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
