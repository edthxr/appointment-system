'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Service } from '@/modules/services/types';
import Pagination from '@/components/Pagination';
import DataTable, { Column } from '@/components/DataTable';
import { ROLES, Role } from '@/lib/constants';
import { useTranslation } from '@/providers/LanguageProvider';

export default function AdminServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ id: string, role: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const clinicSlug = 'aura-premium';

  // Fetch Session
  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSession(data.data);
      });
  }, []);

  const canManage = session && [ROLES.SUPER_ADMIN, ROLES.CLINIC_OWNER, ROLES.CLINIC_ADMIN, ROLES.ADMIN].includes(session.role as any);

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/services?clinicSlug=${clinicSlug}&page=${page}&limit=${pageSize}&search=${debouncedSearch}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, clinicSlug, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', durationMin: 30, price: 0, isActive: true });

  const handleOpenModal = (service: any = null) => {
    if (!canManage) return;
    if (service) {
      setEditingService(service);
      setFormData({ 
        name: service.name, 
        description: service.description || '', 
        durationMin: service.durationMin, 
        price: service.price, 
        isActive: service.isActive 
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', durationMin: 30, price: 0, isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    const url = editingService ? `/api/services/${editingService.id}?clinicSlug=${clinicSlug}` : `/api/services`;
    const method = editingService ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, clinicSlug }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchServices();
      } else {
        alert(data.error || t('common.error'));
      }
    } catch (err) {
      alert(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) return;
    if (!confirm(t('services.delete_confirm'))) return;
    try {
      const res = await fetch(`/api/services/${id}?clinicSlug=${clinicSlug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchServices();
      else alert(data.error || t('common.error'));
    } catch (err) {
      alert(t('common.error'));
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const columns: Column<Service>[] = [
    {
      header: t('services.col_name'),
      accessorKey: 'serviceDetails',
      sortable: true,
      cell: (s) => (
        <div className="flex flex-col">
          <div className="font-bold text-foreground text-[13px] group-hover:text-accent transition-colors uppercase tracking-tight">{s.name}</div>
          <div className="text-[11px] text-foreground-muted truncate max-w-xs mt-0.5 font-medium">{s.description || t('services.no_description')}</div>
        </div>
      )
    },
    {
      header: t('services.col_duration'),
      accessorKey: 'durationMin',
      sortable: true,
      cell: (s) => (
        <div className="text-[11px] font-black text-foreground/70 bg-muted px-4 py-1.5 rounded-full inline-block border border-border-ios uppercase tracking-widest">{s.durationMin} {t('appointments.minutes')}</div>
      )
    },
    {
      header: t('services.col_price'),
      accessorKey: 'price',
      sortable: true,
      cell: (s) => (
        <div className="text-[13px] font-black text-foreground tracking-tighter">฿{Number(s.price).toLocaleString()}</div>
      )
    },
    {
      header: t('common.status'),
      accessorKey: 'isActive',
      sortable: true,
      cell: (s) => (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          s.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-muted text-foreground-muted/50 border-border-ios'
        }`}>
          {s.isActive ? t('services.status_active') : t('services.status_archived')}
        </span>
      )
    },
    ...(canManage ? [{
      header: t('common.actions'),
      accessorKey: 'actions',
      className: 'text-right',
      cell: (s: Service) => (
        <div className="flex justify-end gap-6">
          <button 
            onClick={() => handleOpenModal(s)}
            className="text-[10px] font-black text-accent hover:text-accent/80 uppercase tracking-widest transition-all hover:scale-110"
          >
            {t('common.edit')}
          </button>
          <button 
            onClick={() => handleDelete(s.id)}
            className="text-[10px] font-black text-foreground-muted/40 hover:text-red-500 uppercase tracking-widest transition-all hover:scale-110"
          >
            {t('common.delete')}
          </button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">{t('services.title')}</h1>
          <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-widest">{t('services.subtitle')}</p>
        </div>
        {canManage && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-foreground text-white px-8 py-4 rounded-full font-black uppercase text-[12px] tracking-widest hover:bg-foreground/80 transition-all shadow-lg active:scale-95 flex items-center gap-3 self-start md:self-auto"
          >
            <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('services.add_new')}
          </button>
        )}
      </div>

      <div className="mb-8 max-w-md">
        <div className="relative group">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-border-ios shadow-sm focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-medium text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg 
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-accent transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={services} 
        loading={loading}
        sortKey={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <div className="mt-10">
        <Pagination 
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="card-luxury w-full max-w-lg p-10 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
            <h2 className="text-3xl font-display font-black text-foreground mb-8 tracking-tighter">
              {editingService ? t('services.modal_title_edit') : t('services.modal_title_new')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('services.label_name')}</label>
                <input
                  type="text"
                  required
                  className="w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('services.label_description')}</label>
                <textarea
                  className="w-full h-28"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('services.label_duration')}</label>
                  <input
                    type="number"
                    required
                    className="w-full font-bold"
                    value={formData.durationMin}
                    onChange={(e) => setFormData({ ...formData, durationMin: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">{t('services.label_price')}</label>
                  <input
                    type="number"
                    required
                    className="w-full font-bold"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 py-2 group cursor-pointer" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                <div role="checkbox" aria-checked={formData.isActive} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isActive ? 'bg-accent border-accent' : 'border-border-ios'}`}>
                  {formData.isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <label className="text-[13px] font-bold text-foreground/80 select-none cursor-pointer group-hover:text-foreground transition-colors">{t('services.label_visibility')}</label>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-full bg-muted text-foreground-muted font-black uppercase text-[11px] tracking-widest hover:bg-muted/80 transition-all active:scale-95"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-full bg-foreground text-white font-black uppercase text-[11px] tracking-widest hover:bg-foreground/90 transition-all shadow-lg active:scale-95"
                >
                  {editingService ? t('services.btn_apply') : t('services.btn_create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
