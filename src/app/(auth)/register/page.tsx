'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
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
        setError(data.error || 'ลงทะเบียนไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="card-luxury w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-black tracking-tighter text-foreground mb-3">
            Aura <span className="font-light text-foreground-muted">Clinic</span>
          </h1>
          <p className="text-[13px] font-bold uppercase tracking-widest text-foreground-muted">
            Join Our Exclusive Circle
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-2xl text-[12px] font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Full Name</label>
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
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Email Address</label>
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
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Phone Number</label>
            <input
              type="tel"
              className="w-full"
              placeholder="08XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Secret Key (Password)</label>
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
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <p className="mt-10 text-center text-[12px] font-bold text-foreground-muted">
          Already a member?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
