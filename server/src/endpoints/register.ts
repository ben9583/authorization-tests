import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from '../utils/crypto.js'
import redis from '../utils/redis.js'

let register = (req: Request, res: Response) => {
    res.header('Content-Type', 'application/json')
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
        res.status(400)
        res.send({ error: 'No username or password provided' })
        return
    }

    if(username.length > 31 || password.length > 31) {
        res.status(413)
        res.send({ error: 'Username or password too long' })
        return
    }

    redis.addUser(username, crypto.createPasswordHash(password)).then(() => {
        redis.getIDFromUsername(username).then(id => {
            const token = jwt.sign({
                id: id, 
                username: username 
            }, crypto.SECRET, { 
                expiresIn: '1h',
                issuer: "ben9583/authorization-tests"
            })

            res.header('Set-Cookie', `token=${token}; Path=/; Max-Age=315576000; SameSite=Strict; HttpOnly`)
            res.status(201)
            res.send({
                success: true,
            })
        }).catch(e => {
            res.status(500)
            res.send({
                error: 'Internal Server Error',
            })
            console.log('Redis error:', e)
            return
        })
    }).catch(e => {
        if(e.message === 'Username already exists') {
            res.status(409)
            res.send({
                error: 'User already exists',
            })
            return
        }
        else {
            res.status(500)
            res.send({
                error: 'Internal Server Error',
            })
            console.log('Redis error:', e)
            return
        }
    })
}

export default register;