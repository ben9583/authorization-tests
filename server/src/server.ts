import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from './utils/crypto.js'

import { User } from './index.js'

const PORT = 3001
const app = express()

app.use(express.json())

let users: User[] = [
    {
        id: 1,
        username: 'ben9583',
        hash: 'a1d0a6f4071732c13731ef45b50ab0e1b3010c30835a790a683c9df54e453e09718ffa6f369da8381d43a6b8bbde7c3ea599c9b9104871c17fa5841261bca54c',
    }
]

app.get('/hello', (req, res) => {
    res.send('Hello, World!')
})

app.post('/login', (req, res) => {
    res.header('Content-Type', 'application/json')
    if(req === undefined || req.body === undefined || req.body.username === undefined || req.body.password === undefined || req.body.username === '' || req.body.password === '') {
        res.status(401)
        res.send({
            'error': 'No username or password provided'
        })
    }
    let username = req.body.username
    let password = req.body.password
    let user = users.find(u => u.username === username)
    if (user && user.hash === crypto.createPasswordHash(password)) {
        let token = jwt.sign({
            'id': user.id,
            'name': user.username,
        }, crypto.SECRET, {
            expiresIn: '1h',
            issuer: 'ben9583/authentication-tests',
        })

        res.status(200)
        res.header('Set-Cookie', `token=${token}; Path=/; Max-Age=315576000; SameSite=Strict`)
        res.send({
            'success': true,
            'token': jwt.sign({
                'id': user.id,
                'name': user.username,
            }, crypto.SECRET, {
                expiresIn: '1h',
                issuer: 'ben9583/authentication-tests',
            })
        })
    } else {
        res.status(401)
        res.send({
            'error': 'Invalid username or password'
        })
    }
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
    
})
