// Serveur


const express = require('express');
const app = express();
const http = require('http').createServer(app);
// const path = require('path');
const port = 8080;

const { Socket } = require('socket.io');
const io = new Socket(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname, 'templates/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

http.listen(port, () => {
    console.log(`Listening on http://localhost:${port}/`);
});


console.log('youou')