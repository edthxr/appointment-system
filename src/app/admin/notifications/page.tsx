import { resolveActiveClinic } from '@/lib/clinic-resolver';
import { registry } from '@/lib/registry';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function AdminNotificationsPage() {
  const activeClinic = await resolveActiveClinic();
  if (!activeClinic) {
    redirect('/admin/select-clinic');
  }

  const { data: history } = await registry.notificationRepo.findAll(activeClinic.id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">Communication Log</h1>
        <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">{activeClinic.name} Outreach History</p>
      </div>

      <div className="card-luxury overflow-hidden border-border-ios/40">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border-ios/20">
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Recipient</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Channel</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Type</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-ios/10">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                   <p className="text-[13px] font-bold text-foreground-muted italic opacity-50 uppercase tracking-widest">No notification events recorded</p>
                </td>
              </tr>
            ) : (
              history.map((notif: any) => (
                <tr key={notif.id} className="hover:bg-accent/2 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-foreground">{format(notif.createdAt, 'dd MMM yyyy')}</p>
                    <p className="text-[11px] text-foreground-muted opacity-60 font-medium lowercase tracking-tighter">{format(notif.createdAt, 'HH:mm')}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-black text-foreground uppercase tracking-widest">{notif.user?.name || 'Unknown User'}</p>
                    <p className="text-[11px] text-foreground-muted opacity-60 font-medium italic">{notif.user?.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-black text-accent uppercase tracking-widest border border-border-ios/40">
                      {notif.channel}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-widest opacity-80">{notif.type.replace('_', ' ')}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                          notif.status === 'sent' ? 'bg-green-500' :
                          notif.status === 'failed' ? 'bg-red-500' : 'bg-amber-400'
                       }`} />
                       <p className="text-[11px] font-black uppercase tracking-widest text-foreground opacity-80">{notif.status}</p>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 flex justify-end">
        <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] opacity-40 italic">
          Audit trail maintained for current billing cycle
        </p>
      </div>
    </div>
  );
}
