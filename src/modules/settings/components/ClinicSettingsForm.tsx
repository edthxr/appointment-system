'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Clinic } from '@/modules/clinics/repository';
import { BusinessHours, BlockedSlot } from '@/modules/bookings/types';

interface ClinicSettingsFormProps {
  clinic: Clinic;
  businessHours: BusinessHours[];
  blockedSlots: BlockedSlot[];
}

export default function ClinicSettingsForm({ clinic, businessHours, blockedSlots }: ClinicSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'schedule' | 'blackout'>('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // General State
  const [name, setName] = useState(clinic.name);
  const [logoUrl, setLogoUrl] = useState(clinic.logoUrl || '');
  const [themeConfig, setThemeConfig] = useState(clinic.themeConfig || '');
  
  // Schedule State
  const [hours, setHours] = useState<BusinessHours[]>(businessHours);
  
  // Blackout State
  const [blocks, setBlocks] = useState<BlockedSlot[]>(blockedSlots);
  const [newBlockDate, setNewBlockDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newBlockReason, setNewBlockReason] = useState('');

  const days = [
    { id: 0, th: 'อาทิตย์', en: 'Sunday' },
    { id: 1, th: 'จันทร์', en: 'Monday' },
    { id: 2, th: 'อังคาร', en: 'Tuesday' },
    { id: 3, th: 'พุธ', en: 'Wednesday' },
    { id: 4, th: 'พฤหัสบดี', en: 'Thursday' },
    { id: 5, th: 'ศุกร์', en: 'Friday' },
    { id: 6, th: 'เสาร์', en: 'Saturday' }
  ];

  const handleUpdateClinic = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/clinics/${clinic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logoUrl, themeConfig }),
      });
      if (!res.ok) throw new Error('Failed to update clinic');
      alert('อัปเดตข้อมูลคลินิกสำเร็จ!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateHours = async (bh: BusinessHours) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/business-hours/${bh.id}?clinicId=${clinic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bh),
      });
      if (!res.ok) throw new Error('Failed to update business hours');
      // Update local state is handled within the mapped inputs
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = async () => {
    if (!newBlockDate) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/blocked-slots?clinicId=${clinic.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedDate: newBlockDate, reason: newBlockReason }),
      });
      if (!res.ok) throw new Error('Failed to add blocked slot');
      const newBlock = (await res.json()).data;
      setBlocks([newBlock, ...blocks]);
      setNewBlockReason('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('ยืนยันลบข้อมูลช่วงเวลาที่ปิดรับจอง?')) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/blocked-slots/${id}?clinicId=${clinic.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete blocked slot');
      setBlocks(blocks.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-muted rounded-2xl w-fit border border-border-ios/40 backdrop-blur-sm">
        {(['general', 'schedule', 'blackout'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
              activeTab === tab 
                ? 'bg-white text-foreground shadow-sm' 
                : 'text-foreground-muted hover:text-foreground opacity-60 hover:opacity-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card-luxury p-0 overflow-hidden min-h-[500px] border-border-ios/50 shadow-2xl relative">
        {/* Decorative background for luxury feel */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-10 md:p-14 space-y-10 relative z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
             <div>
                <h2 className="text-2xl font-display font-black tracking-tighter text-foreground mb-1 uppercase">Clinic Identity</h2>
                <p className="text-[12px] font-bold text-foreground-muted uppercase tracking-widest opacity-60">Visual branding and core configuration</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted ml-1">Clinic Official Name</label>
                   <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full"
                      placeholder="e.g. Aura Premium Clinic"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted ml-1">Logo URL Resource</label>
                   <input 
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full"
                      placeholder="https://..."
                   />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted ml-1">Theme Configuration (JSON Object)</label>
                   <textarea 
                      value={themeConfig}
                      onChange={(e) => setThemeConfig(e.target.value)}
                      className="w-full min-h-[120px] font-mono text-xs"
                      placeholder='{ "primary": "#B4975A" }'
                   />
                </div>
             </div>
             
             <button 
                onClick={handleUpdateClinic}
                disabled={isSaving}
                className="bg-foreground text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl active:scale-95 disabled:opacity-50"
             >
                {isSaving ? 'Processing...' : 'Secure Changes'}
             </button>
          </div>
        )}

        {/* Schedule Settings */}
        {activeTab === 'schedule' && (
          <div className="p-10 md:p-14 space-y-10 relative z-10 animate-in fade-in slide-in-from-right-4 duration-700">
             <div>
                <h2 className="text-2xl font-display font-black tracking-tighter text-foreground mb-1 uppercase">Operational Schedule</h2>
                <p className="text-[12px] font-bold text-foreground-muted uppercase tracking-widest opacity-60">Define weekly clinical availability</p>
             </div>

             <div className="space-y-4 border-t border-border-ios/40 pt-8">
                {days.map((day) => {
                  const dayHour = hours.find(h => h.dayOfWeek === day.id);
                  if (!dayHour) return null;
                  
                  return (
                    <div key={day.id} className="flex items-center justify-between group py-2">
                      <div className="w-48">
                        <span className="text-[13px] font-black text-foreground uppercase tracking-widest">{day.en}</span>
                        <p className="text-[10px] font-bold text-foreground-muted opacity-40 uppercase">{day.th}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <input 
                          type="time" 
                          value={dayHour.startTime}
                          onChange={(e) => {
                            const newHours = hours.map(h => h.id === dayHour.id ? { ...h, startTime: e.target.value } : h);
                            setHours(newHours);
                          }}
                          className="px-4 py-2 border-none! bg-muted/50 rounded-xl text-xs font-bold"
                        />
                        <span className="text-foreground-muted opacity-30">—</span>
                        <input 
                          type="time"
                          value={dayHour.endTime}
                          onChange={(e) => {
                            const newHours = hours.map(h => h.id === dayHour.id ? { ...h, endTime: e.target.value } : h);
                            setHours(newHours);
                          }}
                          className="px-4 py-2 border-none! bg-muted/50 rounded-xl text-xs font-bold"
                        />
                        <button 
                          onClick={() => {
                            const newHours = hours.map(h => h.id === dayHour.id ? { ...h, isOpen: !h.isOpen } : h);
                            setHours(newHours);
                          }}
                          className={`ml-4 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                            dayHour.isOpen 
                              ? 'bg-green-500/5 text-green-600 border-green-500/20' 
                              : 'bg-red-500/5 text-red-500 border-red-500/20 opacity-40'
                          }`}
                        >
                          {dayHour.isOpen ? 'Operational' : 'Restricted'}
                        </button>
                        
                        <button 
                          onClick={() => handleUpdateHours(dayHour)}
                          className="p-3 text-accent hover:bg-accent/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {/* Blackout Settings */}
        {activeTab === 'blackout' && (
          <div className="p-10 md:p-14 space-y-10 relative z-10 animate-in fade-in slide-in-from-right-4 duration-700">
             <div>
                <h2 className="text-2xl font-display font-black tracking-tighter text-foreground mb-1 uppercase">Reserved Vacancies</h2>
                <p className="text-[12px] font-bold text-foreground-muted uppercase tracking-widest opacity-60">Manage holidays and temporary blackout periods</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-8 rounded-3xl border border-border-ios/40">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted ml-1">Target Date</label>
                   <input 
                      type="date"
                      value={newBlockDate}
                      onChange={(e) => setNewBlockDate(e.target.value)}
                      className="w-full bg-white! border-none!"
                   />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted ml-1">Reason (Optional)</label>
                   <div className="flex gap-4">
                      <input 
                          value={newBlockReason}
                          onChange={(e) => setNewBlockReason(e.target.value)}
                          className="w-full bg-white! border-none!"
                          placeholder="Public Holiday, Renovation..."
                      />
                      <button 
                         onClick={handleAddBlock}
                         disabled={isSaving}
                         className="whitespace-nowrap bg-foreground text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                         Add Entry
                      </button>
                   </div>
                </div>
             </div>

             <div className="space-y-3 pt-6">
                {blocks.length === 0 ? (
                   <div className="py-12 text-center border-2 border-dashed border-border-ios/40 rounded-3xl">
                      <p className="text-[11px] font-bold text-foreground-muted opacity-40 uppercase tracking-widest italic">No blackout periods registered</p>
                   </div>
                ) : (
                   blocks.map((block) => (
                      <div key={block.id} className="flex items-center justify-between p-5 rounded-2xl border border-border-ios/40 bg-white hover:shadow-md transition-all group">
                         <div>
                            <span className="text-[13px] font-black text-foreground uppercase tracking-widest">
                               {format(new Date(block.blockedDate), 'EEEE, d MMMM yyyy', { locale: th })}
                            </span>
                            <p className="text-[11px] font-bold text-accent uppercase tracking-widest mt-0.5">{block.reason || 'Restricted Slot'}</p>
                         </div>
                         <button 
                            onClick={() => handleDeleteBlock(block.id)}
                            className="text-red-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 p-2"
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                         </button>
                      </div>
                   ))
                )}
             </div>
          </div>
        )}
      </div>

      {/* Warning Section */}
      {activeTab === 'general' && (
        <div className="card-luxury bg-red-50/10 border-red-500/20 p-10 md:p-12 animate-in fade-in duration-1000">
           <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                 <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
              </div>
              <div className="space-y-4">
                 <h2 className="text-xl font-display font-black text-red-900 uppercase tracking-tighter">Clinical De-registry</h2>
                 <p className="text-[12px] text-red-800/70 font-bold leading-relaxed italic uppercase tracking-wider opacity-60">
                    Warning: Initiating a registry purge will permanently erase all historical encounter data and clinical archives. This action is definitive and cannot be reversed by system administrators.
                 </p>
                 <button className="text-red-600 text-[10px] font-black border border-red-200 bg-white px-10 py-4 rounded-full hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-sm">
                    Purge All Archives
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
