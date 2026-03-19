'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useTranslation } from '@/providers/LanguageProvider';

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function StaffManagementPage() {
  const { t, locale } = useTranslation();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'clinic_staff' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const dateLocale = locale === 'th' ? th : enUS;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList([...staffList, data.data]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'clinic_staff' });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(t('staff.error_connection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(staffList.map(s => s.id === id ? { ...s, role: newRole } : s));
      } else {
        alert(data.error || t('staff.update_role_error'));
      }
    } catch (err) {
      alert(t('staff.update_role_error'));
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (!confirm(t('staff.revoke_confirm'))) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStaffList(staffList.filter(s => s.id !== id));
      } else {
        alert(data.error || t('staff.remove_staff_error'));
      }
    } catch (err) {
      alert(t('staff.remove_staff_error'));
    }
  };

  return (
    <div className="max-w-5xl pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">{t('staff.title')}</h1>
          <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">{t('staff.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-foreground text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          {t('staff.add_btn')}
        </button>
      </div>

      <div className="card-luxury overflow-hidden border-border-ios/50">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border-ios/20">
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('staff.col_personnel')}</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('staff.col_access')}</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">{t('staff.col_joined')}</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] text-right">{t('staff.col_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-ios/10">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-foreground-muted text-[13px] font-bold uppercase tracking-widest animate-pulse">{t('staff.loading')}</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-foreground-muted text-[13px] font-bold uppercase tracking-widest italic opacity-50">{t('staff.no_staff')}</td></tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-accent/2 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-foreground">{staff.name}</p>
                    <p className="text-[11px] text-foreground-muted opacity-80 font-medium tracking-tight mt-0.5">{staff.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={staff.role} 
                      onChange={(e) => handleUpdateRole(staff.id, e.target.value)}
                      className="bg-muted/30 border border-border-ios/50 text-[10px] font-black text-foreground uppercase tracking-widest rounded-lg px-3 py-1.5 focus:border-accent outline-none"
                    >
                      <option value="clinic_staff">{t('staff.role_staff')}</option>
                      <option value="clinic_admin">{t('staff.role_admin')}</option>
                      <option value="clinic_owner">{t('staff.role_owner')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[12px] font-bold text-foreground/80 tracking-tight">
                      {staff.createdAt ? format(new Date(staff.createdAt), 'dd MMM yyyy', { locale: dateLocale }) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleRemoveStaff(staff.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                    >
                      {t('staff.revoke_btn')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-display font-black tracking-tighter text-foreground mb-1">{t('staff.modal_title_new')}</h2>
            <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-widest mb-6">{t('staff.modal_subtitle')}</p>
            
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[12px] font-bold">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-2 ml-2">{t('staff.label_name')}</label>
                <input required type="text" className="w-full text-[13px] py-3 px-4" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-2 ml-2">{t('staff.label_email')}</label>
                <input required type="email" className="w-full text-[13px] py-3 px-4" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-2 ml-2">{t('staff.label_password')}</label>
                <input required type="password" minLength={6} className="w-full text-[13px] py-3 px-4" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-2 ml-2">{t('staff.label_role')}</label>
                <select required className="w-full text-[13px] py-3 px-4 outline-none border border-border-ios rounded-2xl" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="clinic_staff">{t('staff.role_staff_desc')}</option>
                  <option value="clinic_admin">{t('staff.role_admin_desc')}</option>
                  <option value="clinic_owner">{t('staff.role_owner_desc')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[11px] font-black text-foreground-muted uppercase tracking-widest bg-muted/50 rounded-2xl hover:bg-muted transition-colors">{t('staff.btn_cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-[11px] font-black text-white uppercase tracking-widest bg-accent rounded-2xl hover:bg-accent/90 focus:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? t('staff.provisioning') : t('staff.btn_provision')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
