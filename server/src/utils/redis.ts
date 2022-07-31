import { createClient } from "redis";
import { User } from "../index.js";

const client = createClient()
client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

if(await client.get('numUsers') == null) {
    await client.set('numUsers', 0)
}

let setUserProperty = async (id: number, field: string, value: any) => {
    if(field === 'username') {
        await client.set(`username:${value}`, id)
    }

    return await client.hSet(`user:${id}`, field, value)
}

let setUserProperties = async (id: number, fields: string[], values: any[]) => {
    if(fields.length !== values.length) {
        throw new Error('Fields and values must be the same length')
    }

    let transaction = client.multi()
    for(let i = 0; i < fields.length; i++) {
        if(fields[i] === 'username') {
            transaction.set(`username:${values[i]}`, id)
        }

        transaction.hSet(`user:${id}`, fields[i], values[i])
    }
    return await transaction.exec()
}

let getUser = async (id: number) => {
    let res = await client.hGetAll(`user:${id}`)

    let user = {} as User
    user.id = parseInt(res.id)
    user.username = res.username
    user.hash = res.hash
    user.name = res.name
    user.bio = res.bio

    return user
}

let getUserProperty = async (id: number, field: string) => {
    return await client.hGet(`user:${id}`, field)
}

let getUserProperties = async (id: number, fields: string[]) => {
    let transaction = client.multi()
    for(let i = 0; i < fields.length; i++) {
        transaction.hGet(`user:${id}`, fields[i])
    }

    let res = await transaction.exec()
    let out = {} as any
    for(let i = 0; i < fields.length; i++) {
        out[fields[i]] = res[i]
    }

    return out
}

let getIDFromUsername = async (username: string) => {
    return await client.get(`username:${username}`)
}

let getNumUsers = async () => {
    let numUsers = await client.get('numUsers')
    if(numUsers == null) numUsers = '0'

    return parseInt(numUsers)
}

let getPropertiesFromAllUsers = async (fields: string[]) => {
    let numUsers = await getNumUsers()

    let transaction = client.multi()
    for(let i = 0; i < numUsers; i++) {
        for(let j = 0; j < fields.length; j++) {
            transaction.hGet(`user:${i}`, fields[j])
        }
    }

    let res = await transaction.exec()
    
    let out = [] as any[]
    for(let i = 0; i < res.length; i += fields.length) {
        out.push({})
        for(let j = 0; j < fields.length; j++) {
            out[i / fields.length][fields[j]] = res[i + j]
        }
    }

    return out
}

let addUser = async (username: string, hash: string, name?: string, bio?: string) => {
    if(name === undefined) name = ''
    if(bio === undefined) bio = ''

    let numUsers = await getNumUsers()

    let id = await client.get(`username:${username}`)
    if(id != null) {
        return new Promise((res, rej) => rej("Username already exists"))
    }
    
    await client.incr('numUsers')
    await client.set(`username:${username}`, numUsers)
    return await setUserProperties(numUsers, ['id', 'username', 'hash', 'name', 'bio'], [numUsers, username, hash, name, bio])
}

export default { setUserProperty, setUserProperties, getUser, getUserProperty, getUserProperties, getIDFromUsername, getNumUsers, getPropertiesFromAllUsers, addUser}