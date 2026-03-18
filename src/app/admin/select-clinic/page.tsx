import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserClinics } from '@/lib/clinic-resolver';
import { getSession } from '@/lib/session';

export default async function SelectClinicPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const clinics = await getUserClinics();

  // If only one clinic, redirect immediately
  if (clinics.length === 1) {
    redirect(`/c/${clinics[0].slug}/admin/calendar`);
  }

  // If no clinics, show error
  if (clinics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">ไม่พบคลินิก</h1>
          <p className="text-foreground-muted mb-6">
            คุณไม่มีสิทธิ์เข้าถึงคลินิกใด ๆ
          </p>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80"
          >
            กลับไปหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    );
  }

  // Show clinic selector
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">เลือกคลินิก</h1>
          <p className="text-foreground-muted">
            กรุณาเลือกคลินิกที่ต้องการดูปฏิทิน
          </p>
        </div>

        <div className="space-y-3">
          {clinics.map((clinic) => (
            <Link
              key={clinic.id}
              href={`/c/${clinic.slug}/admin/calendar`}
              className="block p-4 bg-card border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{clinic.name}</h3>
                  <p className="text-sm text-foreground-muted">
                    บทบาท: {getRoleLabel(clinic.role)}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-foreground-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    clinic_owner: 'เจ้าของคลินิก',
    clinic_admin: 'ผู้ดูแลระบบ',
    clinic_staff: 'พนักงาน',
    customer: 'ลูกค้า',
  };
  return labels[role] || role;
}
