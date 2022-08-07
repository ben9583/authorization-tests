import { Request, Response } from 'express'
import redis from '../utils/redis.js'

let getProfile = (req: Request, res: Response) => {
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
}

export default getProfile;