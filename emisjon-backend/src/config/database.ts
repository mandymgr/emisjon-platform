import { PrismaClient } from '@prisma/client';
import './env'; // Ensure env is loaded before Prisma Client is initialized

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;