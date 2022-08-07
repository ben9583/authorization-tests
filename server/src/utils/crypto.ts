import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config({
    path: '.env.local',
})

const SECRET =
    process.env.SECRET_KEY ||
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

let createPasswordHash = (password: string) => {
    return crypto
        .pbkdf2Sync(password, 'salted: ijqwfeoihqoicn', 1000, 64, 'sha512')
        .toString('hex')
}

let createHMAC = (content: string) => {
    return crypto.createHmac('sha256', SECRET).update(content).digest('hex')
}

export default { createPasswordHash, createHMAC, SECRET }
