import express, { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto from './utils/crypto.js'

import redis from './utils/redis.js'
import { Token, User } from './index.js'

const PORT = 3001
const app = express()

app.use(express.json())

let verifyToken = async (req: Request) => {
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
        decoded = jwt.verify(tokenValue, crypto.SECRET, {issuer: "ben9583/authorization-tests"}) as Token
    } catch (e) {
        console.log('Invalid token')
        return false
    }

    if(decoded.exp < Date.now() / 1000) {
        // Token expired; use refresh token later
        console.log('Token expired')
        return false
    }

    let user = await redis.getUser(decoded.id)
    if(Object.keys(user).length == 0 || isNaN(user.id)) {
        console.log('User not found')
        return false
    }
    return {user: user as User, token: decoded as Token}
}

let verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verifyToken(req).then(user => {
        if(!user) {
            res.status(401).send('Unauthorized')
            return
        }
        req.headers.user = JSON.stringify(user)
        next()
    })
}

app.get('/getUsers', (req, res) => {
    res.header('Content-Type', 'application/json')

    redis.getPropertiesFromAllUsers(['id', 'username']).then(users => {
        res.status(200)
        res.send(users)
        return
    }).catch(e => {
        res.status(500)
        res.send({
            error: 'Internal Server Error',
        })
        console.log('Redis error:', e)
        return
    })
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

    redis.getUserProperties(parseInt(id), ['username', 'name', 'bio']).then(user => {
        if(!user) {
            res.status(400)
            res.send({
                error: 'User not found',
            })
            return
        }

        res.status(200)
        res.send(user)
    }).catch(e => {
        res.status(500)
        res.send({
            error: 'Internal Server Error',
        })
        console.log('Redis error:', e)
    })
})

app.post('/setProfile', verifyTokenMiddleware, (req, res) => {
    res.header('Content-Type', 'application/json')
    if(!req.body.name && !req.body.bio) {
        req.body.name = ''
        req.body.bio = ''
    }

    if(req.body.name > 31 || req.body.bio > 1023) {
        res.status(413)
        res.send({
            error: 'One of the fields is too long',
        })
    }

    let user = JSON.parse(req.headers.user as string) as {user: User, token: Token}

    redis.setUserProperties(user.user.id, ['name', 'bio'], [req.body.name, req.body.bio]).then(() => {
        res.status(200)
        res.send({
            success: true,
        })
    }).catch(e => {
        res.status(500)
        res.send({
            error: 'Internal Server Error',
        })
        console.log('Redis error:', e)
    })
})

app.post('/verify', (req, res) => {
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
    redis.getIDFromUsername(username).then(id => {
        if(!id) {
            res.status(401)
            res.send({
                error: 'Invalid username or password',
            })
            return
        }
        redis.getUserProperty(parseInt(id), 'hash').then(hash => {
            if(hash != crypto.createPasswordHash(password)) {
                res.status(401)
                res.send({
                    error: 'Invalid username or password',
                })
                return
            }

            const token = jwt.sign({
                id: id,
                username: username
            }, crypto.SECRET, {
                expiresIn: '1h',
                issuer: "ben9583/authorization-tests"
            })

            res.status(200)
            res.header('Set-Cookie', `token=${token}; Path=/; Max-Age=315576000; SameSite=Strict; HttpOnly`)
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
        res.status(500)
        res.send({
            error: 'Internal Server Error',
        })
        console.log('Redis error:', e)
        return
    })
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
