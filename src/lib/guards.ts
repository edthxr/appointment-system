import { getSession } from './session';
import { ROLES, Role } from './constants';
import { redirect } from 'next/navigation';

export async function checkAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function checkRole(allowedRoles: Role[]) {
  const session = await checkAuth();
  if (!allowedRoles.includes(session.role)) {
    redirect('/'); // Or a forbidden page
  }
  return session;
}

export async function isAdmin() {
  const session = await getSession();
  return session?.role === ROLES.ADMIN || session?.role === ROLES.SUPER_ADMIN || session?.role === ROLES.CLINIC_ADMIN;
}
