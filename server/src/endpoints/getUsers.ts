import { Request, Response } from 'express'

import redis from '../utils/redis.js'

let getUsers = (req: Request, res: Response) => {
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
}

export default getUsers;