import { IClinicRepository, Clinic } from './repository';

export class ClinicService {
  constructor(private clinicRepo: IClinicRepository) {}

  async getClinic(id: string) {
    const clinic = await this.clinicRepo.findById(id);
    if (!clinic) throw new Error('Clinic not found');
    return clinic;
  }

  async getClinicBySlug(slug: string) {
    const clinic = await this.clinicRepo.findBySlug(slug);
    if (!clinic) throw new Error('Clinic not found');
    return clinic;
  }

  async updateClinic(id: string, data: Partial<Omit<Clinic, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>, userId: string, userRole: string) {
    // Permission Check: Super Admin can update any clinic.
    // Clinic Owner/Admin can only update their own clinic.
    // In a real multi-tenant app, we'd check clinic_users table.
    // For now, we assume the middleware/route handler passed a valid context.
    
    // Safety check: ensure only clinic_owner, clinic_admin, or super_admin can update.
    const allowedRoles = ['super_admin', 'clinic_owner', 'clinic_admin'];
    if (!allowedRoles.includes(userRole)) {
      throw new Error('You do not have permission to update this clinic');
    }

    return this.clinicRepo.update(id, data);
  }
}
