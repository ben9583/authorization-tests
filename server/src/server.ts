import express, { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto from './utils/crypto.js'

import { Token, User } from './index.js'

const PORT = 3001
const app = express()

app.use(express.json())

let users: User[] = [
    {
        id: 1,
        username: 'ben9583',
        hash: 'a1d0a6f4071732c13731ef45b50ab0e1b3010c30835a790a683c9df54e453e09718ffa6f369da8381d43a6b8bbde7c3ea599c9b9104871c17fa5841261bca54c',
        profile: {
            name: 'Ben',
            bio: 'Hello, I am Ben.',
        }
    }
]

let verifyToken = (req: Request) => {
    const cookie = req.headers.cookie
    if (!cookie) {
        console.log('No cookie')
        return false
    }

    const cookies = cookie.split('; ')
    const token = cookies.find(c => c.startsWith('token='))
    if (!token) {
        console.log('No token')
        return false
    }

    const tokenValue = token.split('=')[1]

    let decoded: Token;
    try {
        decoded = jwt.verify(tokenValue, crypto.SECRET, {issuer: "ben9583/authentication-tests"}) as Token
    } catch (e) {
        console.log('Invalid token')
        return false
    }

    if(decoded.exp < Date.now() / 1000) {
        // Token expired; use refresh token later
        console.log('Token expired')
        return false
    }

    let user = users.find(u => u.id === decoded.id)
    if(!user) {
        console.log('User not found in database')
        return false
    }

    return {
        token: decoded,
        user: user
    }
}

let verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = verifyToken(req)
    if(!user) {
        res.status(401).send('Unauthorized')
        return
    }
    req.headers.user = JSON.stringify(user)
    next()
}

app.get('/getUsers', (req, res) => {
    res.header('Content-Type', 'application/json')
    res.status(200)
    res.send(users.map(({id, username, ...other}) => ({id, username})))
})

app.get('/getProfile', (req, res) => {
    res.header('Content-Type', 'application/json')
    if(!req.query.id) {
        res.status(400)
        res.send({
            error: 'Bad Request',
        })
        return
    }
    let id = req.query.id.toString()
    if(!id || isNaN(parseInt(id))) {
        res.status(400)
        res.send({
            error: 'Bad Request',
        })
        return
    }

    let user = users.find(user => user.id === parseInt(id))
    if(!user) {
        res.status(400)
        res.send({
            error: 'User not found',
        })
        return
    }

    res.status(200)
    res.send({
        username: user.username,
        name: user.profile.name,
        bio: user.profile.bio,
    })
})

app.post('/setProfile', verifyTokenMiddleware, (req, res) => {
    res.header('Content-Type', 'application/json')
    if(!req.body.name && !req.body.bio) {
        req.body.name = ''
        req.body.bio = ''
    }

    let user = JSON.parse(req.headers.user as string) as {user: User, token: Token}

    for(let i = 0; i < users.length; i++) {
        if(users[i].id === user.user.id) {
            users[i].profile.name = req.body.name
            users[i].profile.bio = req.body.bio
            break
        }
    }

    res.status(200)
    res.send({
        success: true,
    })
})

app.post('/verify', (req, res) => {
    res.header('Content-Type', 'application/json')
    res.status(200)

    const user = verifyToken(req)
    if(!user) {
        res.send({
            success: false,
        })
        return
    } else {
        res.send({
            success: true,
            content: user.token
        })
    }

})

app.post('/register', (req, res) => {
    res.header('Content-Type', 'application/json')
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
        res.status(400)
        res.send({ error: 'No username or password provided' })
        return
    }

    const user = users.find(u => u.username === username)
    if (user) {
        res.status(409)
        res.send({ error: 'Username already exists' })
        return
    }

    const hash = crypto.createPasswordHash(password)
    const id = users.length + 1
    users.push({ 
        id, 
        username, 
        hash,
        profile: {
            name: '',
            bio: '',
        }
    })

    const token = jwt.sign({
        id: id, 
        username: username 
    }, crypto.SECRET, { 
        expiresIn: '1h',
        issuer: "ben9583/authentication-tests"
    })
    res.header('Set-Cookie', `token=${token}; Path=/; Max-Age=315576000; SameSite=Strict; HttpOnly`)
    res.status(201)
    res.send({
        success: true,
    })

    console.log(users)
})

app.post('/login', (req, res) => {
    res.header('Content-Type', 'application/json')
    if(req === undefined || req.body === undefined || req.body.username === undefined || req.body.password === undefined || req.body.username === '' || req.body.password === '') {
        res.status(401)
        res.send({
            error: 'No username or password provided'
        })
        return
    }
    let username = req.body.username
    let password = req.body.password
    let user = users.find(u => u.username === username)
    if (user && user.hash === crypto.createPasswordHash(password)) {
        let token = jwt.sign({
            id: user.id,
            username: user.username,
        }, crypto.SECRET, {
            expiresIn: '1h',
            issuer: 'ben9583/authentication-tests',
        })

        res.status(200)
        res.header('Set-Cookie', `token=${token}; Path=/; Max-Age=315576000; SameSite=Strict; HttpOnly`)
        res.send({
            success: true,
        })
    } else {
        res.status(401)
        res.send({
            error: 'Invalid username or password'
        })
    }
})

app.post('/logout', (req, res) => {
    res.header('Content-Type', 'application/json')
    res.status(200)
    res.header('Set-Cookie', 'token=; Path=/; Max-Age=0; SameSite=Strict; HttpOnly')
    res.send({
        'success': true
    })  
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
    
})
