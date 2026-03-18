'use client';

import { useState } from 'react';

interface Appointment {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

export default function AppointmentsManagement() {
  const [appointments] = useState<Appointment[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการนัดหมาย</h1>
          <p className="text-foreground-muted mt-2">ดูและจัดการนัดหมายทั้งหมด</p>
        </div>
        <button className="px-6 py-2.5 bg-foreground text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-md active:scale-95">
          + เพิ่มนัดหมาย
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground-muted">ยังไม่มีนัดหมาย</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">ลูกค้า</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">บริการ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">วันที่</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">เวลา</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">สถานะ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-border">
                      <td className="py-3 px-4">{appointment.customer}</td>
                      <td className="py-3 px-4">{appointment.service}</td>
                      <td className="py-3 px-4">{appointment.date}</td>
                      <td className="py-3 px-4">{appointment.time}</td>
                      <td className="py-3 px-4">{appointment.status}</td>
                      <td className="py-3 px-4">
                        <button className="text-accent hover:underline text-sm">แก้ไข</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
