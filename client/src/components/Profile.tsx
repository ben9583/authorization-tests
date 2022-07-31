import { useEffect, useState } from 'react'

function Profile({ user }: { user: any }) {
    let [ name, setName ] = useState("")
    let [ bio, setBio ] = useState("")

    let [ statusText, setStatusText ] = useState("")
    let [ statusColor, setStatusColor ] = useState("#ffffff")

    let update = () => {
        setStatusColor("#ffffff")
        setStatusText("Submitting...")
        fetch("http://localhost:3000/setProfile", {
            method: "POST",
            headers: {
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({
                name: name,
                bio: bio
            })
        }).then(res => {
            res.json().then(body => {
                if(res.status >= 400) {
                    setStatusColor("#ff0000")
                    setStatusText(body.error)
                } else {
                    setStatusColor("#00ff00")
                    setStatusText("Profile saved.")
                }
            })
        })
    }

    useEffect(() => {fetch('http://localhost:3000/getProfile?id=' + user.id).then(res => {
        if(res.status === 200) {
            res.json().then(body => {
                setName(body.name)
                setBio(body.bio)
            })
        }
    })}, [user.id])

    return (
        <div className="Profile">
            <h1>Profile: {user.username}</h1>
            <table>
                <tbody>
                    <tr>
                        <td style={{textAlign: 'left'}}>Change name:</td>
                        <td><input type="text" placeholder="name" value={name} onChange={e => setName(e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td style={{textAlign: 'left'}}>Change bio:</td>
                        <td><input type="text" placeholder="bio" value={bio} onChange={e => setBio(e.target.value)} /></td>
                    </tr>
                </tbody>
            </table>
            <button type="button" onClick={update}>Submit</button>
            <p style={{color: statusColor}}>{statusText}</p>
        </div>
    )
}

export default Profile