import { Request } from 'express'
import jwt from 'jsonwebtoken'

import redis from './redis.js'
import crypto from './crypto.js'
import { User, Token } from '../index.js'

let verifyToken = async (req: Request) => {
    const cookie = req.headers.cookie
    if (!cookie) {
        console.log('No cookie')
        return false
    }

    const cookies = cookie.split('; ')
    const token = cookies.find((c) => c.startsWith('token='))
    if (!token) {
        console.log('No token')
        return false
    }

    const tokenValue = token.split('=')[1]

    let decoded: Token
    try {
        decoded = jwt.verify(tokenValue, crypto.SECRET, {
            issuer: 'ben9583/authorization-tests',
        }) as Token
    } catch (e) {
        console.log('Invalid token')
        return false
    }

    if (decoded.exp < Date.now() / 1000) {
        // Token expired; use refresh token later
        console.log('Token expired')
        return false
    }

    let user = await redis.getUser(decoded.id)
    if (Object.keys(user).length == 0 || isNaN(user.id)) {
        console.log('User not found')
        return false
    }
    return { user: user as User, token: decoded as Token }
}

export default verifyToken
