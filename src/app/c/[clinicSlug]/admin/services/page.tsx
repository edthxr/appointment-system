'use client';

import { useState } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function ServicesManagement() {
  const [services] = useState<Service[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการบริการ</h1>
          <p className="text-foreground-muted mt-2">ดูและจัดการบริการทั้งหมด</p>
        </div>
        <button className="px-6 py-2.5 bg-foreground text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-md active:scale-95">
          + เพิ่มบริการ
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-6">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground-muted">ยังไม่มีบริการ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <p className="text-foreground-muted text-sm mt-1">{service.description}</p>
                  <p className="text-foreground font-bold mt-2">฿{service.price}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="text-accent hover:underline text-sm">แก้ไข</button>
                    <button className="text-red-500 hover:underline text-sm">ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
