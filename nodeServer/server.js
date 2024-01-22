const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.resolve('../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users = {};
const rooms = {};

io.on('connection', socket => {
    socket.on('create-room', ({ username }) => {
        const roomID = generateRoomID();
        rooms[roomID] = { users: [socket.id], admin: socket.id };
        users[socket.id] = { username, roomID };
        socket.join(roomID);
        socket.emit('room-created', { roomID, username });

        // Broadcast the message to all users in the room
        io.to(roomID).emit('receive', { message: `${username} created the room.`, name: 'System' });
    });

    socket.on('join-room', ({ username, roomID }) => {
        const room = rooms[roomID];
        if (room) {
            room.users.push(socket.id);
            users[socket.id] = { username, roomID };
            socket.join(roomID);
            socket.emit('room-joined', { roomID, username });

            const broadcastSocket = io.sockets.sockets.get(room.admin);
            if (broadcastSocket) {
                broadcastSocket.to(roomID).emit('user-joined', username);
            }
        }
    });

    socket.on('send', ({ message, username, roomID }) => {
        io.to(roomID).emit('receive', { message, name: username });
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            const room = rooms[user.roomID];
            if (room) {
                const index = room.users.indexOf(socket.id);
                if (index !== -1) {
                    room.users.splice(index, 1);
                    socket.to(user.roomID).broadcast.emit('left', user.username);
                    if (socket.id === room.admin) {
                        delete rooms[user.roomID];
                    }
                }
            }
            delete users[socket.id];
        }
    });
});



function generateRoomID() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});
