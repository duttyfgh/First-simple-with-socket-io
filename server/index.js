const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 5000

const http = require('http').Server(app)
const socketIO = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:5173'
    }
})

app.get('api', (request, response) => {
    response.json({
        message: 'Hello'
    })
})

const users = []

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user connected`)

    socket.on('message', (data) => {
        socketIO.emit('response', data)
    })

    socket.on('typing', (data) => socket.broadcast.emit('responseTyping', `${data}...`))

    socket.on('newUser', (data) => {
        users.push(data)
        socketIO.emit('responseNewUser', users)
    })

    socket.on('leaveUser', (username) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                users.splice(i, 1);
                return;
            }
        }
        socketIO.emit('updatedUsers', users)
    })

    socket.on('disconnect', (socket) => {
        console.log(`${socket.id} user disconnected`)
    })
})

http.listen(PORT, () => {
    console.log('Server has been started')
})