import { useEffect, useState } from 'react'

function Users() {
    let [ users, setUsers ] = useState([{}]) as [ any[], React.Dispatch<React.SetStateAction<any[]>> ]

    useEffect(() => {
        fetch('http://localhost:3000/getUsers').then(res => {
            if(res.status !== 200) {
                return
            }
            res.json().then(body => {
                setUsers(body)
            })
        })
    }, [])
    
    return (
        <div className="Users">
            <h1>Users</h1>
            {
                users.map(user => {
                    return (
                        <div key={user.id}>
                            <a href={'/user/' + user.id}>{user.username}</a>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Users