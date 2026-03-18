'use client';

import { useState } from 'react';
import { User } from '@/modules/auth/types';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user: initialUser }: ProfileFormProps) {
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
        setMessage({ type: 'success', text: 'อัปเดตข้อมูลส่วนตัวสำเร็จ' });
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
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
        setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' });
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
        <h2 className="text-xl font-display font-black mb-8 text-foreground uppercase tracking-widest">General Identity</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Full Name</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full bg-muted/40 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="Clinic Owner Name"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-muted/20 border-border-ios/10 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground-muted cursor-not-allowed opacity-60"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Contact Phone</label>
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
              Update Credentials
            </button>
          </div>
        </form>
      </section>

      {/* Security */}
      <section className="card-luxury p-10 border-border-ios/40 bg-accent/2">
        <h2 className="text-xl font-display font-black mb-8 text-accent uppercase tracking-widest">Security Protocol</h2>
        <form onSubmit={handleChangePassword} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Current Secret</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white/60 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">New Secret</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/60 border-border-ios/20 rounded-2xl px-5 py-4 text-[13px] font-bold text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Confirm New Secret</label>
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
              Rotate Access Secret
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
