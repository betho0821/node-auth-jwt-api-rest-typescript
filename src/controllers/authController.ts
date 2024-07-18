import { Request, Response } from "express";
import { comparePasswords, hashPassword } from "../services/password.service";
import prisma from '../models/user';
import { generateToken } from "../services/auth.service";


export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);

    // Usar prisma directamente para crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error: any) {
    console.log(error);
    if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
      res.status(400).json({ error: 'El correo ya está registrado' });
      return; // Añadir return aquí para evitar doble respuesta
    }
    res.status(500).json({ error: 'Hubo un error en el registro' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "El usuario no se encuentra registrado" });
      return;
    }

    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Usuario y contraseña no coinciden' });
      return;
    }

    const token = generateToken(user);
    res.status(200).json({ token });

  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({ error: 'Hubo un error en el inicio de sesión' });
  }
}