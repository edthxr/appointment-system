import { db } from '@/db/client';
import { clinics, clinicUsers, users } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { getSession } from './session';
import { cache } from 'react';

export interface ResolvedClinic {
  id: string;
  slug: string;
  name: string;
  role: string;
}

/**
 * Resolve active clinic for the current logged-in user
 * Priority:
 * 1. User's clinic with owner/admin role (first one)
 * 2. User's clinic with staff role (first one)
 * 3. User's clinic with customer role (first one)
 * 4. Any active clinic (fallback for super_admin)
 * 
 * Cached per-request to avoid duplicate DB calls
 */
export const resolveActiveClinic = cache(async (): Promise<ResolvedClinic | null> => {
  const session = await getSession();
  if (!session) return null;

  // Super admin can access any clinic - get first active one
  if (session.role === 'super_admin') {
    const firstClinic = await db.query.clinics.findFirst({
      where: eq(clinics.isActive, true),
      orderBy: desc(clinics.createdAt),
    });
    
    if (firstClinic) {
      return {
        id: firstClinic.id,
        slug: firstClinic.slug,
        name: firstClinic.name,
        role: 'super_admin',
      };
    }
  }

  // Get user's clinics with role hierarchy
  const userClinics = await db
    .select({
      clinicId: clinics.id,
      clinicSlug: clinics.slug,
      clinicName: clinics.name,
      role: clinicUsers.role,
    })
    .from(clinicUsers)
    .innerJoin(clinics, eq(clinicUsers.clinicId, clinics.id))
    .where(
      and(
        eq(clinicUsers.userId, session.id),
        eq(clinics.isActive, true)
      )
    );

  if (userClinics.length === 0) return null;

  // Sort by role priority: owner > admin > staff > customer
  const rolePriority: Record<string, number> = {
    clinic_owner: 1,
    clinic_admin: 2,
    clinic_staff: 3,
    customer: 4,
  };

  const sortedClinics = userClinics.sort((a, b) => {
    return (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99);
  });

  const primaryClinic = sortedClinics[0];

  return {
    id: primaryClinic.clinicId,
    slug: primaryClinic.clinicSlug,
    name: primaryClinic.clinicName,
    role: primaryClinic.role,
  };
});

/**
 * Get all clinics the user has access to
 */
export const getUserClinics = cache(async (): Promise<ResolvedClinic[]> => {
  const session = await getSession();
  if (!session) return [];

  // Super admin can access all clinics
  if (session.role === 'super_admin') {
    const allClinics = await db.query.clinics.findMany({
      where: eq(clinics.isActive, true),
      orderBy: desc(clinics.createdAt),
    });

    return allClinics.map(clinic => ({
      id: clinic.id,
      slug: clinic.slug,
      name: clinic.name,
      role: 'super_admin',
    }));
  }

  const userClinics = await db
    .select({
      clinicId: clinics.id,
      clinicSlug: clinics.slug,
      clinicName: clinics.name,
      role: clinicUsers.role,
    })
    .from(clinicUsers)
    .innerJoin(clinics, eq(clinicUsers.clinicId, clinics.id))
    .where(
      and(
        eq(clinicUsers.userId, session.id),
        eq(clinics.isActive, true)
      )
    )
    .orderBy(desc(clinicUsers.createdAt));

  return userClinics.map(uc => ({
    id: uc.clinicId,
    slug: uc.clinicSlug,
    name: uc.clinicName,
    role: uc.role,
  }));
});
