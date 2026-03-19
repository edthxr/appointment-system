import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserClinics } from '@/lib/clinic-resolver';
import { getSession } from '@/lib/session';
import { getTranslation } from '@/lib/i18n-server';

export default async function SelectClinicPage() {
  const session = await getSession();
  const { t } = await getTranslation();
  
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
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('select_clinic.no_clinics_title')}</h1>
          <p className="text-foreground-muted mb-6">
            {t('select_clinic.no_clinics_desc')}
          </p>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
          >
            {t('select_clinic.back_to_dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  // Show clinic selector
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-3">{t('select_clinic.title')}</h1>
          <p className="text-foreground-muted text-sm font-medium">
            {t('select_clinic.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {clinics.map((clinic) => (
            <Link
              key={clinic.id}
              href={`/c/${clinic.slug}/admin/calendar`}
              className="group block p-6 bg-white border border-border-ios rounded-3xl hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-foreground group-hover:text-accent transition-colors">{clinic.name}</h3>
                  <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-widest mt-1">
                    {t('common.status')}: <span className="text-accent">{getLocalizedRole(clinic.role, t)}</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getLocalizedRole(role: string, t: any): string {
  const key = `select_clinic.role_${role}`;
  const translated = t(key);
  // If no translation found, t(key) returns key. We want to fallback to a readable string or the role itself.
  return translated === key ? role : translated;
}
