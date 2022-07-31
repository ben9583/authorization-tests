import { useState } from 'react'

function Register() {
    let [ username, setUsername ] = useState("")
    let [ password, setPassword ] = useState("")

    let [ statusText, setStatusText ] = useState("")
    let [ statusColor, setStatusColor ] = useState("#ffffff")

    let register = () => {
        setStatusColor("#ffffff")
        setStatusText("Submitting...")
        fetch("http://" + window.location.href.split('/')[2] + "/register", {
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
                if(res.status >= 400) {
                    setStatusColor("#ff0000")
                    setStatusText(body.error)
                } else {
                    window.location.href = "/"
                }
            })
        })
    }

    return (
        <div className="Register">
            <h1>Register</h1>
            <input name="username" type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)}/><br />
            <input name="password" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} /><br />
            <button type="button" onClick={register}>Register</button><br />
            <p style={{color: statusColor, width: '50%', position: 'relative', left: '25%', overflowWrap: 'break-word'}}>{statusText}</p>
        </div>
    )
}

export default Register