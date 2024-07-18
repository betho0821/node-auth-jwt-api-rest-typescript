import { Request, Response } from "express";
import { hashPassword } from "../services/password.service";
import prisma from "../models/user";



export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({ error: 'Email y contraseña son obligatorios' });
            return;
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create(
            {
                data: {
                    email,
                    password: hashedPassword

                }
            }
        )

        res.status(201).json(user)
    } catch (error: any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ error: 'El correo ya está registrado' });
            return; // Añadir return aquí para evitar doble respuesta
        }
        res.status(500).json({ error: 'Hubo un error en el registro' });
    }
}
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users);
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error, pruebe mas tarde' })
    }
}
export const getUserById = async (req: Request, res: Response): Promise<void> => {

    const userId = parseInt(req.params.id)

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            res.status(404).json({ error: 'el usuario no fue encontrado' })
            return
        }
        res.status(200).json(user);
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error, pruebe mas tarde' })
    }
}
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    const { email, password } = req.body

    try {

        let dataToUpdate: any = { ...req.body }

        if (password) {
            const hashedPassword = await hashPassword(password)
            dataToUpdate.password = hashedPassword
        }
        if (email) {
            dataToUpdate.email = email
        }

        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: dataToUpdate
        })
        res.status(200).json(user);
    } catch (error: any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ error: 'el email ingresado ya existe' })
        } else if (error?.code == 'P2025') {
            res.status(404).json('usuario no encontrado')
        } else {
            console.log(error)
            res.status(500).json({ error: 'Hubo un error, pruebe mas tarde' })
        }
    }
}
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    try {
        await prisma.user.delete({
            where: {
                id: userId
            }
        })

        res.status(200).json({
            message: `El usuario ${userId} ha sido eliminado`
        }).end()
    } catch (error: any) {

    }
}