import express, { Request, Response, NextFunction } from 'express'

import verifyToken from './utils/token.js'
import getProfile from './endpoints/getProfile.js'
import getUsers from './endpoints/getUsers.js'
import login from './endpoints/login.js'
import logout from './endpoints/logout.js'
import register from './endpoints/register.js'
import setProfile from './endpoints/setProfile.js'
import verify from './endpoints/verify.js'

const PORT = 3001
const app = express()

app.use(express.json())

let verifyTokenMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    verifyToken(req).then((user) => {
        if (!user) {
            res.status(401).send('Unauthorized')
            return
        }
        req.headers.user = JSON.stringify(user)
        next()
    })
}

app.get('/getUsers', getUsers)
app.get('/getProfile', getProfile)

app.post('/setProfile', verifyTokenMiddleware, setProfile)
app.post('/verify', verify)
app.post('/register', register)
app.post('/login', login)
app.post('/logout', logout)

app.listen(PORT, () =>
    console.log(`Authorization Tests server listening on port ${PORT}`)
)
