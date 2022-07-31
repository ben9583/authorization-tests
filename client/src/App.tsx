import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import Register from "./components/Register"
import Profile from "./components/Profile"
import Login from "./components/Login"
import Logout from "./components/Logout"
import User from "./components/User"
import Users from "./components/Users"

function App({ loggedIn, content }: { loggedIn: boolean, content: any }) {
    return (
        <div className="App">
            <header className="App-header">
                <a style={{position: 'absolute', left: 25, top: 25}} href="/">Home</a>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home loggedIn={loggedIn} content={content} />} />
                        <Route path="/register" element={loggedIn ? <Navigate to='/' /> : <Register />} />
                        <Route path="/profile" element={loggedIn ? <Profile user={content} /> : <Navigate to='/login' />} />
                        <Route path="/login" element={loggedIn ? <Navigate to='/profile' /> : <Login />} />
                        <Route path="/logout" element={loggedIn ? <Logout /> : <Navigate to='/' />} />
                        <Route path="/user/:id" element={<User />} />
                        <Route path="/users" element={<Users />} />
                    </Routes>
                </BrowserRouter>
            </header>
        </div>
    )
}

export default App