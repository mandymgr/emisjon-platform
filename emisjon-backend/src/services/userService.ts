import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  level?: number;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface UpdateUserDTO {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  level?: number;
}

export async function createUser(data: CreateUserDTO) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const role = data.role || 'USER';
  const level = data.level || 1;

  // Validate level based on role
  if (role === 'USER' && (level < 1 || level > 3)) {
    throw new Error('User level must be between 1 and 3');
  }
  if (role === 'ADMIN' && (level < 1 || level > 2)) {
    throw new Error('Admin level must be between 1 and 2');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role,
      level,
    },
    include: {
      shareholder: true,
    },
  });

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  
  const { password: _, ...userResponse } = user;
  return { user: userResponse, token };
}

export async function loginUser(data: LoginDTO) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      shareholder: true,
    },
  });

  if (!user) {
    // User not found - suggest registration
    const error: any = new Error('User not found. Please register to create an account.');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    // Wrong password
    const error: any = new Error('Incorrect password. Please try again.');
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  // Update last login timestamp removed - field doesn't exist in new schema

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  
  const { password: _, ...userResponse } = user;
  return { user: userResponse, token };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      shareholder: true,
    },
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userResponse } = user;
  return userResponse;
}

export async function updateUser(id: string, data: UpdateUserDTO) {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  if (data.email && data.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailExists) {
      throw new Error('Email already in use');
    }
  }

  if (data.role && data.level !== undefined) {
    // Validate level based on role
    if (data.role === 'USER' && (data.level < 1 || data.level > 3)) {
      throw new Error('User level must be between 1 and 3');
    }
    if (data.role === 'ADMIN' && (data.level < 1 || data.level > 2)) {
      throw new Error('Admin level must be between 1 and 2');
    }
  }

  const updateData: any = { ...data };
  
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

  const { password: _, ...userResponse } = user;
  return userResponse;
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.delete({
    where: { id },
  });

  return { message: 'User deleted successfully' };
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    include: {
      shareholder: true,
    },
    orderBy: [
      { role: 'desc' },
      { level: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return users.map(({ password: _, ...user }) => user);
}

