import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwtSecret);
};