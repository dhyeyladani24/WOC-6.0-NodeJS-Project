const socket = io('http://localhost:3000');

const form = document.getElementById('send-container');
const messageInp = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const createRoom = document.getElementById('createRoomBtn');
const joinRoom = document.getElementById('joinRoomBtn');

let username = null;
let roomID = null;

function append(message, position) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
}


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInp.value;
    append(`you : ${message}`, 'right');
    socket.emit('send', { message, username, roomID });
    messageInp.value = '';
});

// Event listeners for room-related events
createRoom.addEventListener('click', createRoom => {
    username = prompt("Enter your name:");

    if (username) {
        socket.emit('create-room', { username });
    } else {
        alert("Invalid input. Please provide a username.");
    }
});

joinRoom.addEventListener('click', joinRoom => {
    username = prompt("Enter your name:");
    roomID = prompt("Enter room ID:");

    if (username && roomID) {
        socket.emit('join-room', { username, roomID });
    } else {
        alert("Invalid input. Please provide a username and room ID.");
    }
});

socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', (data) => {
    append(`${data.name}: ${data.message}`, 'left');
});

socket.on('left', (name) => {
    append(`${name}: left the chat`, 'left');
});

socket.on('room-created', (data) => {
    append(`Room ${data.roomID} created. You are joined as ${data.username}`, 'right');
});

socket.on('room-joined', (data) => {
    append(`${data.username} joined Room ${data.roomID}`, 'right');
});
