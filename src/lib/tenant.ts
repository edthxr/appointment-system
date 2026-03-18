import { db } from '@/db/client';
import { clinics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

/**
 * Get current clinic details from slug.
 * Used in server components and server actions.
 */
export const getClinicBySlug = cache(async (slug: string) => {
  if (!slug) return null;
  
  const result = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  return result[0] || null;
});

/**
 * Common layout helper to extract clinicSlug from params
 */
export function getClinicSlugFromParams(params: { clinicSlug?: string } | any) {
  return params?.clinicSlug;
}
