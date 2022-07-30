import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import Register from "./components/Register"
import Profile from "./components/Profile"
import Login from "./components/Login"
import User from "./components/User"

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/users" element={<User />} />
                    </Routes>
                </BrowserRouter>
            </header>
        </div>
    )
}

export default App