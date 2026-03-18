'use client';

import { useEffect, useState } from 'react';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(res => { if (res.success) setServices(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', durationMin: 30, price: 0, isActive: true });

  const fetchServices = () => {
    setLoading(true);
    fetch('/api/services')
      .then(res => res.json())
      .then(res => { if (res.success) setServices(res.data); })
      .finally(() => setLoading(false));
  };

  const handleOpenModal = (service: any = null) => {
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
    const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
    const method = editingService ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchServices();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      alert('เชื่อมต่อไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบบริการนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchServices();
      else alert(data.error || 'ลบไม่สำเร็จ');
    } catch (err) {
      alert('เชื่อมต่อไม่สำเร็จ');
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">Clinic Services</h1>
          <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-widest">Procedural Menu Management</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-foreground text-white px-8 py-4 rounded-full font-black uppercase text-[12px] tracking-widest hover:bg-foreground/80 transition-all shadow-lg active:scale-95 flex items-center gap-3 self-start md:self-auto"
        >
          <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Service
        </button>
      </div>

      <div className="card-luxury p-0 overflow-hidden border-border-ios/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-ios">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Service Details</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-ios bg-white">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-foreground-muted text-[12px] font-medium italic">Refreshing service list...</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-foreground-muted text-[12px] font-medium italic">No clinical services defined</td></tr>
              ) : services.map((s) => (
                <tr key={s.id} className="hover:bg-surface transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="font-bold text-foreground text-[13px] group-hover:text-accent transition-colors uppercase tracking-tight">{s.name}</div>
                    <div className="text-[11px] text-foreground-muted truncate max-w-xs mt-0.5 font-medium">{s.description || 'No description provided'}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-[11px] font-black text-foreground/70 bg-muted px-4 py-1.5 rounded-full inline-block border border-border-ios">{s.durationMin} MINS</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-[13px] font-black text-foreground tracking-tighter">฿{Number(s.price).toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      s.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-muted text-foreground-muted/50 border-border-ios'
                    }`}>
                      {s.isActive ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-6">
                      <button 
                        onClick={() => handleOpenModal(s)}
                        className="text-[10px] font-black text-accent hover:text-accent/80 uppercase tracking-widest transition-all hover:scale-110"
                      >
                        Modify
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="text-[10px] font-black text-foreground-muted/40 hover:text-red-500 uppercase tracking-widest transition-all hover:scale-110"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="card-luxury w-full max-w-lg p-10 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
            <h2 className="text-3xl font-display font-black text-foreground mb-8 tracking-tighter">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Service Title</label>
                <input
                  type="text"
                  required
                  className="w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Service Description</label>
                <textarea
                  className="w-full h-28"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    className="w-full font-bold"
                    value={formData.durationMin}
                    onChange={(e) => setFormData({ ...formData, durationMin: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-foreground-muted uppercase tracking-widest mb-2 ml-1">Price (THB)</label>
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
                <label className="text-[13px] font-bold text-foreground/80 select-none cursor-pointer group-hover:text-foreground transition-colors">Visible to clients</label>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-full bg-muted text-foreground-muted font-black uppercase text-[11px] tracking-widest hover:bg-muted/80 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-full bg-foreground text-white font-black uppercase text-[11px] tracking-widest hover:bg-foreground/90 transition-all shadow-lg active:scale-95"
                >
                  {editingService ? 'Apply Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
