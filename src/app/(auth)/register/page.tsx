'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/providers/LanguageProvider';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || t('auth.error_failed'));
      }
    } catch (err) {
      setError(t('booking.error_connection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="card-luxury w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-black tracking-tighter text-foreground mb-3">
            {t('auth.login_title')}
          </h1>
          <p className="text-[13px] font-bold uppercase tracking-widest text-foreground-muted">
            {t('auth.exclusive_circle')}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-2xl text-[12px] font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('auth.name_label')}</label>
            <input
              type="text"
              required
              className="w-full"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('auth.email_label')}</label>
            <input
              type="email"
              required
              className="w-full"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('auth.phone_label')}</label>
            <input
              type="tel"
              className="w-full"
              placeholder="08XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('auth.secret_key_label')}</label>
            <input
              type="password"
              required
              className="w-full"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-white py-4 rounded-full font-black uppercase text-[12px] tracking-widest hover:bg-foreground/90 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? t('auth.processing') : t('auth.create_account')}
          </button>
        </form>

        <p className="mt-10 text-center text-[12px] font-bold text-foreground-muted">
          {t('auth.already_have_account')}{' '}
          <Link href="/login" className="text-accent hover:underline">
            {t('auth.login_here')}
          </Link>
        </p>
      </div>
    </div>
  );
}
