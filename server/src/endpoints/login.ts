import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import redis from '../utils/redis.js'
import crypto from '../utils/crypto.js'

let login = (req: Request, res: Response) => {
    res.header('Content-Type', 'application/json')
    if (
        req === undefined ||
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.password === undefined ||
        req.body.username === '' ||
        req.body.password === ''
    ) {
        res.status(401)
        res.send({
            error: 'No username or password provided',
        })
        return
    }
    let username = req.body.username
    let password = req.body.password
    redis
        .getIDFromUsername(username)
        .then((id) => {
            if (!id) {
                res.status(401)
                res.send({
                    error: 'Invalid username or password',
                })
                return
            }
            redis
                .getUserProperty(parseInt(id), 'hash')
                .then((hash) => {
                    if (hash != crypto.createPasswordHash(password)) {
                        res.status(401)
                        res.send({
                            error: 'Invalid username or password',
                        })
                        return
                    }

                    const token = jwt.sign(
                        {
                            id: id,
                            username: username,
                        },
                        crypto.SECRET,
                        {
                            expiresIn: '1h',
                            issuer: 'ben9583/authorization-tests',
                        }
                    )

                    res.status(200)
                    res.header(
                        'Set-Cookie',
                        `token=${token}; Path=/; Max-Age=315576000; SameSite=Strict; HttpOnly`
                    )
                    res.send({
                        success: true,
                    })
                })
                .catch((e) => {
                    res.status(500)
                    res.send({
                        error: 'Internal Server Error',
                    })
                    console.log('Redis error:', e)
                    return
                })
        })
        .catch((e) => {
            res.status(500)
            res.send({
                error: 'Internal Server Error',
            })
            console.log('Redis error:', e)
            return
        })
}

export default login
