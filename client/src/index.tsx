import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

fetch('http://' + window.location.href.split('/')[2] + '/verify', {
    method: 'POST'
}).then(res => {
    res.json().then(body => {
        if(body.success) {
            root.render(
                <React.StrictMode>
                    <App loggedIn={true} content={body.content} />
                </React.StrictMode>
            )
        } else {
            root.render(
                <React.StrictMode>
                    <App loggedIn={false} content='' />
                </React.StrictMode>
            )
        }
    })
})