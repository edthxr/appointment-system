export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">แดชบอร์ด</h1>
        <p className="text-foreground-muted mt-2">ภาพรวมการจัดการคลินิก</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-foreground-muted">นัดหมายวันนี้</h3>
          <p className="text-2xl font-bold text-foreground mt-2">0</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-foreground-muted">ลูกค้าทั้งหมด</h3>
          <p className="text-2xl font-bold text-foreground mt-2">0</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-foreground-muted">บริการทั้งหมด</h3>
          <p className="text-2xl font-bold text-foreground mt-2">0</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-foreground-muted">รายได้เดือนนี้</h3>
          <p className="text-2xl font-bold text-foreground mt-2">฿0</p>
        </div>
      </div>
    </div>
  );
}
