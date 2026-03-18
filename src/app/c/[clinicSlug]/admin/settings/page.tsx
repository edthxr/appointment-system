export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">ตั้งค่า</h1>
        <p className="text-foreground-muted mt-2">จัดการการตั้งค่าคลินิก</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">ข้อมูลคลินิก</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ชื่อคลินิก</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="กรอกชื่อคลินิก"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ที่อยู่</label>
              <textarea 
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={3}
                placeholder="กรอกที่อยู่คลินิก"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">เบอร์โทรศัพท์</label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">การทำงาน</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">เวลาทำการ</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="time" 
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
                <input 
                  type="time" 
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">วันหยุด</label>
              <div className="space-y-2">
                {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((day) => (
                  <label key={day} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-foreground">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-foreground text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-md active:scale-95">
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
}
