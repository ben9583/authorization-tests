import { Request, Response } from 'express'

let logout = (req: Request, res: Response) => {
    res.header('Content-Type', 'application/json')
    res.status(200)
    res.header(
        'Set-Cookie',
        'token=; Path=/; Max-Age=0; SameSite=Strict; HttpOnly'
    )
    res.send({
        success: true,
    })
}

export default logout
