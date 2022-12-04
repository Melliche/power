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
  console.log("a user connected");

  socket.on("name", (player) => {
    console.log(player + "name");
  });

  socket.on("playerData", (player) => {
    let room = null;

    if (!player.roomId) {
      room = createRoom(player);
      console.log(player);
      console.log(`[create room ] - ${room.id} - ${player.username}`);
    } else {
      room = rooms.find((r) => r.id === player.roomId);

      if (room === undefined) {
        return;
      }
      player.roomId = room.id;
      room.players.push(player);
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
    io.to(player.roomId).emit("play", player);
  });

  socket.on("play again", (player) => {
    let room = rooms.find((r) => r.id === player.roomId);
    // TODO verif que le joueur ne puisse pas demander de restart plusieurs fois
    if (player.wantRestart === true) {
      room.wantRestart++
    }

    if (room && room.players.length === 2 && room.wantRestart === 2) {
      room.wantRestart = 0;
      io.to(room.id).emit("play again", playerSetToStart(room.players));
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

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
  const room = { id: roomId(), players: [], wantRestart: 0 };

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
