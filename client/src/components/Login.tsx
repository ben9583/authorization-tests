import { useState } from 'react'

function Login() {
    let [ username, setUsername ] = useState("")
    let [ password, setPassword ] = useState("")

    let [ statusText, setStatusText ] = useState("")
    let [ statusColor, setStatusColor ] = useState("#ffffff")

    let login = () => {
        setStatusColor("#ffffff")
        setStatusText("Submitting...")
        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(res => {
            res.json().then(body => {
                if(res.status === 401) {
                    setStatusColor("#ff0000")
                    setStatusText(body.error)
                } else {
                    setStatusColor("#00ff00")
                    setStatusText("Success! Here is your token: " + body.token)
                }
            })
        })
    }

    return (
        <div className="Login">
            <form action="http://localhost:3000/login" method="post">
                <input name="username" type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)}/>
                <input name="password" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={login}>Login</button>
                <p style={{color: statusColor, width: '50%', position: 'relative', left: '25%', overflowWrap: 'break-word'}}>{statusText}</p>
            </form>
        </div>
    )
}

export default Login
