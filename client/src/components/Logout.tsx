function Logout() {
    fetch('http://' + window.location.href.split('/')[2] + '/logout', {
        method: 'POST'
    }).then(_ => {
        window.location.href = '/'
    })

    return (
        <div className="Logout">
            <h1>Logging out...</h1>
        </div>
    )
}

export default Logout