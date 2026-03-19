import { th } from '@/locales/th';
import { en } from '@/locales/en';
import { cookies } from 'next/headers';

export async function getTranslation() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'th';
  
  const translations = locale === 'en' ? en : th;

  return {
    t: (key: string, params?: Record<string, any>) => {
      const keys = key.split('.');
      let current: any = translations;
      for (const k of keys) {
        if (!current || current[k] === undefined) {
           // Fallback to English if Thai key is missing
           if (locale === 'th') {
             let enCurrent: any = en;
             for (const ek of keys) {
               if (!enCurrent || enCurrent[ek] === undefined) return key;
               enCurrent = enCurrent[ek];
             }
             current = enCurrent;
             break;
           }
           return key;
        }
        current = current[k];
      }
      
      if (typeof current !== 'string') return key;

      if (params) {
        let templated = current;
        Object.entries(params).forEach(([k, v]) => {
          templated = templated.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
        return templated;
      }

      return current;
    },
    locale
  };
}
