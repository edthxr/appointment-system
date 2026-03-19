import { cookies } from 'next/headers';
import { Role } from './constants';

// Mock session for MVP
// In a real app, this would use JWT or a database session
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  clinicId?: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get('mock_session')?.value;
  
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set('mock_session', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('mock_session');
}
