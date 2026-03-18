export interface Clinic {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  themeConfig?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClinicRepository {
  findById(id: string): Promise<Clinic | null>;
  findBySlug(slug: string): Promise<Clinic | null>;
  update(id: string, data: Partial<Omit<Clinic, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>): Promise<Clinic>;
}
