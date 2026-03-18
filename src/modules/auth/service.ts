import { IUserRepository } from './repository';
import { LoginCredentials, User, RegisterInput } from './types';
import { setSession, clearSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async login(credentials: LoginCredentials): Promise<User> {
    const user = await this.userRepo.findWithPasswordByEmail(credentials.email);
    
    if (!user) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    
    if (!isValid) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const { passwordHash, ...safeUser } = user;

    await setSession({
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
    });

    return safeUser;
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
