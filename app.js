// Serveur


const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const port = 8080;

const { Server } = require('socket.io');
/**
 * @type {Socket}
 */
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}/`);
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('play', () => {
        console.log('message');
        io.emit('play')
      });

    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
});



console.log('youou')