// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client'; // Asegúrate de que el tipo User esté bien importado

const secret = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};
