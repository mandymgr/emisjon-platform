import prisma from '../../config/database';
import { CreateUserDTO, LoginDTO, UserResponse } from './model';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';

export class UserService {
  async createUser(data: CreateUserDTO): Promise<{ user: UserResponse; token: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || data.email.split('@')[0], // Use email prefix as name if not provided
        password: hashedPassword,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });
    
    const { password, ...userResponse } = user;
    return { user: userResponse, token };
  }

  async login(data: LoginDTO): Promise<{ user: UserResponse; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ userId: user.id, email: user.email });
    
    const { password, ...userResponse } = user;
    return { user: userResponse, token };
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { password, ...userResponse } = user;
    return userResponse;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      include: {
        shareholder: true,
      },
    });
    return users.map(({ password, ...user }: any) => user);
  }

  async updateUser(id: string, data: Partial<CreateUserDTO> & { role?: string; level?: number }): Promise<UserResponse> {
    const updateData: any = {};
    
    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        shareholder: true,
      },
    });

    const { password, ...userResponse } = user;
    return userResponse;
  }

  async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}