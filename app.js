// Serveur

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const port = 8080;

const { Server } = require("socket.io");
/**
 * @type {Socket}
 */
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/index.html"));
});

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`);
});

let rooms = [];

io.on("connection", (socket) => {
  console.log(socket.id)
  console.log("a user connected");

  socket.on("name", (player) => {
    console.log(player + "name");
  });

  socket.on("playerData", (player) => {
    let room = null;
    if (!player.roomId) {
      room = createRoom(player);
      io.emit("list rooms", rooms); // actualise la liste des rooms
      console.log(`[create room ] - ${room.id} - ${player.username}`);
    } else {
      room = rooms.find((r) => r.id === player.roomId);
      if (room === undefined) {
        return;
      }
      let playerInRoom = room.players[0]
      //vérifie que le même joueur ne puisse pas rejoindre sa room plusieurs fois
      if (playerInRoom.socketId !== player.socketId) { 
        player.roomId = room.id;
        room.players.push(player);
      }
    }

    socket.join(room.id);

    io.to(socket.id).emit("join room", room.id);

    if (room.players.length === 2) {
      io.to(room.id).emit("start game", playerSetToStart(room.players));
    }
  });

  socket.on("refreshRoom", (p) => {
    io.to(p.roomId).emit("refreshRoom", p);
  });

  socket.on("info", () => {
    // rooms.forEach((r) => console.log(r.players));
  });

  socket.on("get rooms", () => {
    io.to(socket.id).emit("list rooms", rooms);
  });

  socket.on("play", (player) => {
    let room = rooms.find((r) => r.id === player.roomId);
    room.playedCell++
    // if (room.playedCell === 42) {

    // }
    console.log(room.players);

    io.to(player.roomId).emit("play", player, room.playedCell);
  });

  socket.on("play again", (player) => {
    let room = rooms.find((r) => r.id === player.roomId);
    // TODO verif que le joueur ne puisse pas demander de restart plusieurs fois
    if (player.wantRestart === true) {
      room.wantRestart++
    }

    if (room && room.players.length === 2 && room.wantRestart === 2) {
      room.wantRestart = 0;
      room.playedCell = 0;
      io.to(room.id).emit("play again", playerSetToStart(room.players));
    }
  });

  socket.on("disconnect", () => {
    // let room = rooms.find((r) => r.id === player.roomId);
    console.log(socket.id)
    console.log("user disconnected");
  });
});


// TODO gérer la suppression d'une room quand aucun joueur n'est dedans
const interval = setInterval(function() {
  if (rooms) {
    rooms.forEach((room) => {
      diff = Math.abs(new Date - new Date(room.createDate));
      if (diff >= 60000 && room.players.length < 2) {
        rooms.splice(room, 1);
      }
    })
  }
}, 60000);

function playerSetToStart(players) {
  updatePlayers = players;
  updatePlayers.forEach((player) => {
    player.turn = false;
    player.win = false;
  });
  let playerturn = Math.floor(Math.random() * 2);
  updatePlayers[playerturn].turn = true;
  return updatePlayers
}

function createRoom(player) {
  const room = { id: roomId(), players: [], wantRestart: 0, playedCell: 0, createDate: new Date };

  player.roomId = room.id;
  console.log("create room");
  room.players.push(player);
  rooms.push(room);
  console.log(player);
  return room;
}

//génère un id random de salon
function roomId() {
  return Math.random().toString(36).substr(2, 9);
}
