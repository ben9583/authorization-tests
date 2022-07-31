function Home({loggedIn, content} : {loggedIn: boolean, content: any}) {
    return (
        <div className="Home">
            <h1>Authentication Tests</h1>
            {
                loggedIn ?
                    <p>Welcome, {content.username}. <a href={"/user/" + content.id}>View</a> or <a href="/profile">edit</a> your profile or <a href="/logout">log out</a>.</p> 
                    :
                    <p>Please <a href="/login">log in</a> if you have an account or <a href="/register">register</a> otherwise.</p>
            }
            <p>See a list of <a href='/users'>users.</a></p>
                
        </div>
    )
}

export default Home
