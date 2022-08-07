import { Request, Response } from 'express'
import redis from '../utils/redis.js'
import { User, Token } from '../index.js'
import verifyToken from '../utils/token.js'


let verify = (req: Request, res: Response) => {
    res.header('Content-Type', 'application/json')

    verifyToken(req).then(user => {
        res.status(200)
        if(!user) {
            res.send({
                success: false
            })
            return
        }
        res.send({
            success: true,
            content: user.token,
        })
        return
    }).catch(e => {
        res.status(500)
        res.send({
            error: 'Internal Server Error',
        })
        console.log('Redis error:', e)
        return
    })
}

export default verify;