import { useState, useEffect } from 'react'

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
                    window.location.href = "/"
                }
            })
        })
    }

    useEffect(() => {
        fetch('http://localhost:3000/verify', {
            method: 'POST'
        }).then(res => {
            res.json().then(body => {
                if(body.success) {
                    window.location.href = "/"
                }
            })
        })
    }, [])

    return (
        <div className="Login">
            <h1>Login</h1>
            <input name="username" type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)}/><br />
            <input name="password" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} /><br />
            <button type="button" onClick={login}>Login</button><br />
            <p style={{color: statusColor, width: '50%', position: 'relative', left: '25%', overflowWrap: 'break-word'}}>{statusText}</p>
        </div>
    )
}

export default Login
