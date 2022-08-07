import { Request, Response } from 'express'
import redis from '../utils/redis.js'
import { User, Token } from '../index.js'

let setProfile = (req: Request, res: Response) => {
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
}

export default setProfile;