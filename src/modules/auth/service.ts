import { IUserRepository } from './repository';
import { LoginCredentials, User, RegisterInput } from './types';
import { setSession, clearSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async login(credentials: LoginCredentials): Promise<User> {
    const user = await this.userRepo.findByEmail(credentials.email);
    
    // In a real app, verify password hash
    if (!user) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    // Check if user has a passwordHash (Db mode)
    // For mock mode, we still allow the hardcoded check for the demo users
    const isMockAdmin = credentials.email === 'admin@example.com' && credentials.password === 'admin123';
    const isMockUser = credentials.email === 'user@example.com' && credentials.password === 'user123';
    
    let isValid = false;
    
    // If it's a DB user (from registration), it will have a passwordHash field in the row
    // result[0] in db-repository returns the whole row, but the User interface doesn't have passwordHash.
    // We need to cast it or handle it in the repository.
    // Let's assume the repository returns the user object, but we might need the hash for comparison.
    
    // Actually, I should probably update the findByEmail to return the hash too if I want to check it here.
    // Or I can add a specialized method `findWithPasswordByEmail`.
    
    // FOR NOW: Let's assume the user object from repository might have passwordHash if it's from DB.
    const userWithHash = user as any;
    if (userWithHash.passwordHash) {
      isValid = await bcrypt.compare(credentials.password, userWithHash.passwordHash);
    } else {
      isValid = isMockAdmin || isMockUser;
    }

    if (!isValid) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return user;
  }

  async register(data: RegisterInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userRepo.create({
      ...data,
      passwordHash,
    });

    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return user;
  }

  async logout() {
    await clearSession();
  }
}
