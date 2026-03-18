'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      
      if (data.success) {
        const user = data.data;
        if (user.role === 'super_admin') {
          router.push('/superadmin/dashboard');
        } else if (['admin', 'clinic_owner', 'clinic_admin', 'clinic_staff'].includes(user.role)) {
          router.push('/admin/dashboard');
        } else {
          router.push('/c/aura-premium'); 
        }
        router.refresh(); 
      } else {
        setError(data.error || 'ล็อกอินไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setError('Connection error');
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
            Management Portal
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-2xl text-[12px] font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-white py-4 rounded-full font-black uppercase text-[12px] tracking-widest hover:bg-foreground/90 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border-ios text-center space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted/50 transition-opacity hover:opacity-100 italic">
            Demo Access
          </p>
          <div className="text-[11px] font-bold text-foreground-muted/70 flex flex-col gap-1">
            <span>Owner: owner@example.com / owner123</span>
            <span>Admin: admin@example.com / admin123</span>
            <span>Staff: staff@example.com / staff123</span>
            <span>User: user@example.com / user123</span>
          </div>
        </div>

        <p className="mt-10 text-center text-[12px] font-bold text-foreground-muted">
          Don't have an account?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
