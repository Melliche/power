const socket = io();

const player = {
  host: false,
  roomId: null,
  username: "",
  socketId: "",
  turn: false,
  playedCell: "",
};
board = [];

const form = document.getElementById("form");
const input = document.getElementById("input");
const boite = document.getElementById("box");
const cells = document.querySelectorAll(".cell");
const check = document.getElementById("check");
const roomsCard = document.getElementById("rooms-card");
const roomsList = document.getElementById("rooms-list");

const game = document.getElementById("game");
const blue = document.getElementById("blue");

socket.emit("get rooms");

socket.on("list rooms", (rooms) => {
  html = "";
  if (rooms.length > 0) {
    console.log("rooms");
    rooms.forEach((room) => {
      if (room.players.length !== 2) {
        html += `<li class="room">
                <p class="p-room">Salon de ${room.players[0].username} - ${room.id}</p>
                <button class="join-room" data-room="${room.id}">Rejoindre</button>
             </li>`;
      }
    });
  }
  if (html !== "") {
    roomsCard.style.display = "contents";
    roomsList.innerHTML = html;

    for (const element of document.getElementsByClassName("join-room")) {
      element.addEventListener("click", joinRoom, false);
    }
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  player.username = input.value;
  player.socketId = socket.id;
  player.host = true;
  player.turn = true;
  roomsCard.style.display = "none";
  roomsList.style.display = "none";

  socket.emit("playerData", player);
});

check.addEventListener("click", function (e) {
  console.log(player);
  console.log(board);
});

// pour chaque clique de cell
cells.forEach((cell) => {
  cell.onclick = function () {
    let playedCell = this.getAttribute("id");
    if (player.turn) {
      console.log(playedCell)
      let columcell = playedCell.substring(0, 1);

      // cell = playedCell.substring(2)
      // console.log(board)
      for (let i = 0; i < board[columcell].length; i++) {
        if (board[columcell][i] == 0) {
          board[columcell][i] = 1;
          playedCell = `${columcell}-${i}`;
          player.playedCell = playedCell;
          document.getElementById(`${playedCell}`).classList.add("team");
          getWinner(columcell, playedCell.substring(2));
          break;
        }
      }
      player.turn = false;
      socket.emit("play", player);
    }
  };
});

socket.on("play", (ennemyPlayer) => {
  if (ennemyPlayer.socketId !== player.socketId && !ennemyPlayer.turn) {
    columcell = ennemyPlayer.playedCell.substring(0, 1);
    // let cell = ennemyPlayer.playedCell.substring(2)
    // console.log(board)
    for (let i = 0; i < board[columcell].length; i++) {
      if (board[columcell][i] == 0) {
        board[columcell][i] = 2;
        let playedCell = `${columcell}-${i}`;
        player.playedCell = playedCell;
        // console.log(board)
        document.getElementById(`${playedCell}`).classList.add("danger");
        getWinner(columcell, playedCell.substring(2));
        break;
      }
    }
    player.turn = true;
  }
});

socket.on("join room", (roomId) => {
  player.roomId = roomId;
});

socket.on("start game", (players) => {
  console.log(players);
  startGame(players);
});

function getWinner(columcell, cell) {
  console.log(columcell);
  board[columcell];
  console.log(cell)

  equal = 1;
  //vertical
  for (let i = 0; i < board[columcell].length; i++) {
    // console.log(board[columcell][i], "board element case");
    board[columcell][i] != 0 && board[columcell][i] == board[columcell][i + 1]
      ? equal++
      : equal = 1;
    if (equal >= 4) {
      console.log(board[columcell][i], ' GAGNANT VERTICAL');
    }
  }

  //horizontal
  for (let i = 0; i < board.length; i++) {
    // console.log(board[columcell][i], "board element case");
    board[i][cell] != 0 && board[i][cell] == board[i + 1][cell]
      ? equal++
      : equal = 1;
    if (equal >= 4) {
      console.log(board[i][cell], ' GAGNANT HORIZONTAL');

    }
  }
}

function startGame(players) {
  table();
  document.getElementById("game").classList.remove("none");

  const ennemyPlayer = players.find((p) => p.socketId != player.socketId);
  ennemyUsername = ennemyPlayer.username;

  // if (player.host && player.turn) {
  //     setTurnMessage('alert-info', 'alert-success', "C'est ton tour de jouer");
  // } else {
  //     setTurnMessage('alert-success', 'alert-info', `C'est au tour de <b>${ennemyUsername}</b> de jouer`);
  // }
}

// Quand un joueur rejoins une room et qu'il n'est pas l'host
const joinRoom = function () {
  console.log("joinroom");
  if (input.value !== "" && input.value.length >= 3) {
    player.username = input.value;
    player.socketId = socket.id;
    player.roomId = this.dataset.room;
    socket.emit("playerData", player);

    roomsCard.style.display = "none";
    roomsList.style.display = "none";
  }
};

function table(rows = 6, columns = 7) {
  for (let i = 0; i < columns; i++) {
    board[i] = Array(rows).fill(0);

    // let column = document.createElement('div')
    // column.classList.add('blue');
    // column.setAttribute('id', `row-${i}`);
    // game.appendChild(column)
    // for(let i = 0; i < columns; i++){
    //     let green = document.createElement('div')
    //     green.setAttribute('id', `col-${i}`, 'cell');
    //     green.classList.add('green', 'cell');
    //     column.appendChild(green)

    // }
  }
}
