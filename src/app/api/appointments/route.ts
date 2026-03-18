import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { checkAuth } from '@/lib/guards';

const bookingRepo = registry.bookingRepo;

export async function GET(req: NextRequest) {
  const session = await checkAuth();
  
  if (session.role === 'admin') {
    const all = await bookingRepo.findAll();
    return apiResponse.success(all);
  } else {
    const mine = await bookingRepo.findByUserId(session.id);
    return apiResponse.success(mine);
  }
}
