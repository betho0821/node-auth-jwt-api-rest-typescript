import express, { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/usersController'


const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'



const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {

        return res.status(401).json({error:"no autorizado"})
        
    }

    jwt.verify(token, JWT_SECRET,(err,decoded)=>{
        if (err) {
            console.error('error en la utenticacion', err)
            return res.status(403).json({error: 'no tienes acceso a este recurso'})
        }

        next();
    })

}

router.post('/', authenticateToken,  createUser)
router.get('/', authenticateToken, getAllUsers)
router.get('/:id', authenticateToken, getUserById)
router.put('/:id', authenticateToken, updateUser)
router.delete('/:id', authenticateToken, deleteUser)


export default router;
