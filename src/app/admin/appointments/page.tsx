'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import Pagination from '@/components/Pagination';
import DataTable, { Column } from '@/components/DataTable';
import { cn } from '@/lib/utils';


function AppointmentsContent() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('appointmentDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Detail Drawer State
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingIdParam = searchParams.get('bookingId');


  const clinicSlug = 'aura-premium';

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?clinicSlug=${clinicSlug}&page=${page}&limit=${pageSize}&search=${debouncedSearch}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, clinicSlug, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle deep-linking
  useEffect(() => {
    if (bookingIdParam) {
      const found = appointments.find(a => a.id === bookingIdParam);
      if (found) {
        setSelectedAppointment(found);
        setIsDrawerOpen(true);
      } else {
        // If not in current page, we might need a separate fetch for just one booking
        const fetchOne = async () => {
          try {
            const res = await fetch(`/api/bookings/${bookingIdParam}?clinicSlug=${clinicSlug}`);
            const data = await res.json();
            if (data.success) {
              setSelectedAppointment(data.data);
              setIsDrawerOpen(true);
            }
          } catch (err) {
            console.error('Failed to fetch specific booking:', err);
          }
        };
        fetchOne();
      }
    }
  }, [bookingIdParam, appointments, clinicSlug]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Remove query param without refreshing
    const params = new URLSearchParams(searchParams.toString());
    params.delete('bookingId');
    router.replace(`/admin/appointments?${params.toString()}`);
  };


  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}?clinicSlug=${clinicSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      } else {
        alert(data.error || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
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

  const columns: Column<any>[] = [
    {
      header: 'Customer Details',
      accessorKey: 'userName',
      sortable: true,
      cell: (a) => (
        <div className="flex flex-col">
          <div className="font-bold text-foreground text-[13px] group-hover:text-accent transition-colors">{a.user?.name}</div>
          <div className="text-[11px] text-foreground-muted mt-0.5">{a.user?.email}</div>
        </div>
      )
    },
    {
      header: 'Service',
      accessorKey: 'service',
      sortable: true,
      cell: (a) => (
        <span className="text-[12px] font-black text-foreground/80 tracking-tight uppercase">{a.service?.name}</span>
      )
    },
    {
      header: 'Schedule',
      accessorKey: 'appointmentDate',
      sortable: true,
      cell: (a) => (
        <div className="flex flex-col">
          <div className="text-[12px] font-black text-foreground tracking-tight">{format(new Date(a.appointmentDate), 'dd MMM yyyy')}</div>
          <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-1">{a.startTime} – {a.endTime}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (a) => (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          a.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
          a.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
          'bg-yellow-50 text-yellow-600 border-yellow-100'
        }`}>
          {a.status === 'confirmed' ? 'Verified' : 
           a.status === 'cancelled' ? 'Voided' : 'Pending'}
        </span>
      )
    },
    {
      header: 'Control',
      accessorKey: 'actions',
      className: 'text-right',
      cell: (a) => (
        <div className="flex justify-end gap-6">
          <button 
            onClick={() => {
              setSelectedAppointment(a);
              setIsDrawerOpen(true);
            }}
            className="text-[10px] font-black text-accent hover:text-foreground uppercase tracking-widest transition-all hover:scale-110"
          >
            Details
          </button>
          {a.status === 'pending' && (
            <button 
              onClick={() => handleUpdateStatus(a.id, 'confirmed')}
              className="text-[10px] font-black text-green-600 hover:text-green-800 uppercase tracking-widest transition-all hover:scale-110"
            >
              Verify
            </button>
          )}
          {a.status !== 'cancelled' && (
            <button 
              onClick={() => handleUpdateStatus(a.id, 'cancelled')}
              className="text-[10px] font-black text-foreground-muted hover:text-red-500 uppercase tracking-widest transition-all hover:scale-110"
            >
              Void
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2" id="appointments-title">Appointments</h1>
          <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">Client Service Masterlist</p>
        </div>
        <div className="text-[11px] font-black text-foreground-muted italic bg-muted px-4 py-2 rounded-full border border-border-ios">
          Showing {appointments.length} of {total} scheduled visits
        </div>
      </div>

      <div className="mb-8 max-w-md">
        <div className="relative group">
          <input
            id="search-appointments"
            type="text"
            placeholder="Search Appointments..."
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
              id="clear-search"
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
        data={appointments} 
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

      {/* Appointment Detail Drawer */}
      {isDrawerOpen && selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeDrawer} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-10">
                <button onClick={closeDrawer} className="p-2 -ml-2 text-foreground-muted hover:text-foreground transition-colors group">
                  <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  selectedAppointment.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
                  selectedAppointment.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
                  'bg-yellow-50 text-yellow-600 border-yellow-100'
                )}>
                  {selectedAppointment.status}
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-4">Patient Information</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-foreground text-white flex items-center justify-center text-xl font-black">
                      {selectedAppointment.user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-foreground">{selectedAppointment.user?.name}</h2>
                      <p className="text-sm text-foreground-muted">{selectedAppointment.user?.email}</p>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Service</p>
                    <p className="text-sm font-bold text-foreground">{selectedAppointment.service?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Duration</p>
                    <p className="text-sm font-bold text-foreground">{selectedAppointment.service?.durationMin} mins</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Date</p>
                    <p className="text-sm font-bold text-foreground">{format(new Date(selectedAppointment.appointmentDate), 'EEEE, dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Time Slot</p>
                    <p className="text-sm font-bold text-foreground">{selectedAppointment.startTime} – {selectedAppointment.endTime}</p>
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Notes from Patient</p>
                  <div className="bg-muted/50 p-6 rounded-3xl border border-border-ios/50">
                    <p className="text-sm text-foreground italic leading-relaxed">
                      {selectedAppointment.note || "No additional notes provided."}
                    </p>
                  </div>
                </section>

                <section className="pt-12 border-t border-border-ios/30 flex gap-4">
                  {selectedAppointment.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                      className="flex-1 bg-foreground text-white py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-xl shadow-foreground/20 active:scale-95"
                    >
                      Verify Appointment
                    </button>
                  )}
                  {selectedAppointment.status !== 'cancelled' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                      className="flex-1 border border-border-ios py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
                    >
                      Void Appointment
                    </button>
                  )}
                </section>

                <p className="text-center text-[9px] font-bold text-foreground-muted uppercase tracking-widest">
                  Booking ID: {selectedAppointment.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapping with Suspense for useSearchParams
export default function AdminAppointmentsPage() {
  return (
    <Suspense fallback={<div>Loading appointments...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}

