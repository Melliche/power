const socket = io();

const player = {
  host: false,
  roomId: null,
  username: "",
  socketId: "",
  turn: false,
  playedCell: "",
  win: false,
  score: 0,
};

let board = [];

const form = document.getElementById("form");
const input = document.getElementById("input");
const boite = document.getElementById("box");
const columns = document.querySelectorAll(".column");
const check = document.getElementById("check");
const roomsCard = document.getElementById("rooms-card");
const roomsList = document.getElementById("rooms-list");
const header = document.getElementById('header');
const game = document.getElementById("game");
// const blue = document.getElementById("blue");
const info = document.getElementById('info');
const victory = document.getElementById('victory');


socket.emit("get rooms");

socket.on("list rooms", (rooms) => {
  html = "";
  if (rooms.length > 0) {
    console.log("rooms");
    rooms.forEach((room) => {
      if (room.players.length !== 2) {
        html += `<li class="room">
                <p class="title-room">${room.players[0].username}</p>
                <p class="p-room">${room.players.length}  / 2 dans <br> le salon ${room.id}</p>
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
columns.forEach((column) => {
  column.onclick = function () {
    let playedCell = this.getAttribute("id");
    if (player.turn) {
      let columnIndex = playedCell.substring(4);
      for (let i = 0; i < board[columnIndex].length; i++) {
        if (board[columnIndex][i] == 0) {
          board[columnIndex][i] = player.username;
          playedCell = `${columnIndex}-${i}`;
          console.log(playedCell)
          player.playedCell = playedCell;
          document.getElementById(`${playedCell}`).classList.add("team");
          player.win = getWinner(columnIndex, playedCell.substring(2));
          break;
        }
      }
      player.turn = false;
      socket.emit("play", player);

      if (player.win) {
        game.classList.add('none');
        info.classList.add('none')
        victory.classList.remove('none');
        document.getElementById('h2').innerHTML = 'Vous avez gagné';
      }
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
        board[columcell][i] = ennemyPlayer.username;
        let playedCell = `${columcell}-${i}`;
        player.playedCell = playedCell;
        // console.log(board)
        document.getElementById(`${playedCell}`).classList.add("danger");

        // getWinner(columcell, playedCell.substring(2));
        break;
      }
    }
    player.turn = true;
    if (ennemyPlayer.win) {
      game.classList.add('none');
      info.classList.add('none')
      victory.classList.remove('none');
      document.getElementById('h2').innerHTML = 'Vous avez perdu';
    }
  }
  
});

socket.on("join room", (roomId) => {
  player.roomId = roomId;
});

socket.on("start game", (players) => {
  console.log(players);
  startGame(players);
});

socket.on('play again', (players) => {
  console.log('socket on')
  restartGame(players);
})

function getWinner(columcell, cell) {
  let equal = 0;
  //vertical
  for (let i = 0; i < board[columcell].length; i++) {
    board[columcell][i] == player.username ? equal++ : (equal = 0);
    if (equal >= 4) {
      console.log(board[columcell][i], " GAGNANT VERTICAL");
      equal = 0;
      return true;
    }
  }

  //horizontal
  for (let i = 0; i < board.length; i++) {
    board[i][cell] == player.username ? equal++ : (equal = 0);
    if (equal >= 4) {
      console.log(board[i][cell], " GAGNANT HORIZONTAL");
      equal = 0;
      return true;
    }
  }

  //diagonale

  equal = 0;
  let columnIndex = parseInt(columcell) - parseInt(cell);
  for (
    let i = Math.max(columnIndex, 0);
    i < Math.min(board[columcell].length, board.length + columnIndex);
    i++
  ) {
    board[i][i - columnIndex] == player.username ? equal++ : (equal = 0);
    if (equal >= 4) {
      console.log("DIAGDIAGDIAGDIAG");
      equal = 0;
      return true;
    }
  }

  // diagonale opposé
  equal = 0;
  columnIndex = parseInt(columcell) + parseInt(cell);
  for (
    let i = Math.max(columnIndex - board.length + 1, 0);
    i < Math.min(board[columcell].length, columnIndex + 1);
    i++
  ) {
    board[i][columnIndex - i] == player.username ? equal++ : (equal = 0);
    if (equal >= 4) {
      console.log("ANTIANTIANTIANTIANTIANTIANTI");
      equal = 0;
      return true;
    }
  }
}

function startGame(players) {
  table();
  header.style.display = 'none';
  info.classList.remove('none')
  game.classList.remove("none");
  victory.classList.add('none');

  const ennemyPlayer = players.find((p) => p.socketId != player.socketId);
  ennemyUsername = ennemyPlayer.username;

  document.getElementById('player1').innerHTML = player.username
  document.getElementById('player2').innerHTML = ennemyPlayer.username
  
}

function restartGame(players = null) {
  console.log('restart')
  if (player.host && !players) {
    console.log('efez')
      player.turn = true;
      socket.emit('play again', player.roomId);
  }

  const cells = document.getElementsByClassName('cell');

  if (!player.host) {
      player.turn = false;
  }

  player.win = false;

  if (players) {
      startGame(players);
  }
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
  board = [];
  for (let i = 0; i < columns; i++) {
    board[i] = Array(rows).fill(0);
    for (let j = 0; j < rows; j++) {
      let cellToClear = `${i}-${j}`;
      console.log(cellToClear)
      document.getElementById(`${cellToClear}`).classList.remove('danger', 'team');
    }
    // console.log(document.querySelectorAll('.cell')) 
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

// console.log(board)
// console.log(board.length)
// console.log(Math.max((cell - columcell), 0))
// a = board.length
// // console.log(board[columcell].length)
// b = board[columcell].length
// for(let i = 0;( cell < b)&& (columcell < a); i++ ) {
//   // console.log('columncell + 1= ',columcell++)   //
//   // console.log('cell + 1 = ',cell++) //
//   // console.log('board[columcell + 1][cell + 1] = ',board[columcell++][cell++]) //
//   board[columcell++][cell++] == player.username ? equal++ : (equal = 0);
//   if (equal >= 4) {
//     console.log(board[columcell++][cell++], " GAGNANT DIAGONAL");
//   }
// }
