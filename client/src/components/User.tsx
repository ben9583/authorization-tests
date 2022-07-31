import { useEffect, useState } from 'react'

function User(props: any) {
    let [ loaded, setLoaded ] = useState(false)
    let [ user, setUser ] = useState({}) as [any, React.Dispatch<React.SetStateAction<any>>]

    const id = window.location.href.split("/")[4]

    useEffect(() => {fetch('/getProfile?id=' + id).then(res => {
        if(res.status !== 200) {
            setLoaded(true)
        } else {
            res.json().then(body => {
                setLoaded(true)
                setUser(body)
            })
        }
    })}, [id])

    return (
        <div className="User">
            {loaded ? 
                user.username === undefined ?
                    <h1>User not found</h1> :
                    (
                        <>
                        <h1>{user.username}</h1>
                        <h3 style={{margin: 0}}>Name</h3>
                        <p style={{marginTop: 0}}>{user.name === '' ? 'None' : user.name}</p>
                        <h3 style={{margin: 0}}>About</h3>
                        <p style={{marginTop: 0}}>{user.bio === '' ? 'None' : user.bio}</p>
                        </>
                    )
                    :
                    <></>
            }
        </div>
    )
}

export default User