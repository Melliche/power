const socket = io();

socket.on("connect", () => {
  console.log(socket.id);
});

let player = {
  host: false,
  roomId: null,
  username: "",
  socketId: "",
  turn: false,
  playedCell: "",
  win: false,
  score: 0,
  wantRestart: false,
};

let playersInRoom;
let ennemyPlayer;
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
const waitingPlayer = document.getElementById('waitingPlayer');
// const blue = document.getElementById("blue");
const info = document.getElementById('info');
const victory = document.getElementById('victory');
const restartButton = document.getElementById('restartButton');
const waitingEnemy = document.getElementById('waitingEnemy');
const wantReplay = document.getElementById('wantReplay');
const player1Timer = document.getElementById('player1-timer');
const player2Timer = document.getElementById('player2-timer');


socket.emit("get rooms");

socket.on("list rooms", (rooms) => {
  html = "";
  if (rooms.length > 0) {
    console.log("rooms");
    rooms.forEach((room) => {
      if (room.players.length === 1) {
        html += `<li class="room">
                <p class="title-room">${room.players[0].username}</p>
                <p class="p-room">${room.players.length}  / 2 dans <br> le salon ${room.id}</p>
                <button class="join-room" data-room="${room.id}">Rejoindre</button>
             </li>`;
      }
    });
  }
  if (html !== "" && !player.host) {
    roomsCard.style.display = "contents";
    roomsList.innerHTML = html;

    for (const element of document.getElementsByClassName("join-room")) {
      element.addEventListener("click", joinRoom, false);
    }
  }
  if (rooms.length < 1) {
    roomsList.innerHTML = '';
  }
});

// Creation d'une room
form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value !== "" && input.value.length >= 3) {
    player.username = input.value;
    console.log(socket.id)
    player.socketId = socket.id;
    player.host = true;
    form.style.display = 'none';
    roomsCard.style.display = "none";
    waitingPlayer.classList.remove('none');
    socket.emit("playerData", player);
  }
});

check.addEventListener("click", function (e) {
  console.log(player);
  console.log(board);
});

// Quand un joueur rejoins une room et qu'il n'est pas l'host
const joinRoom = function () {
  if (input.value !== "" && input.value.length >= 3) {
    player.username = input.value;
    player.socketId = socket.id;
    player.roomId = this.dataset.room;
    socket.emit("playerData", player);

    roomsCard.style.display = "none";
    roomsList.style.display = "none";
  }
};

function addListener (elements) {
  elements.forEach((element) => {
    element.addEventListener('click', columnClick)
  })
  elements.forEach((element) => { 
    element.addEventListener('mouseenter', columnEnter)
  })
  elements.forEach((element) => { 
    element.addEventListener('mouseleave', columnLeave)
  })
}

function removeListener (elements) {
  elements.forEach((element) => {
    element.removeEventListener('click', columnClick)
  })
  elements.forEach((element) => { 
    element.removeEventListener('mouseenter', columnEnter)
  })
  elements.forEach((element) => { 
    element.removeEventListener('mouseeleave', columnLeave)
  })
}

function columnEnter (e) {
  e.currentTarget.style.backgroundColor = '#385068';
}

function columnLeave (e) {
  e.currentTarget.style.backgroundColor = ''
}

function columnClick (e) {
  console.log(e.currentTarget.id)
  let playedCell = e.currentTarget.id;
  console.log(player.turn);
  console.log(playersInRoom)
  socket.emit("info");
  if (player.turn === true) {
    let columnIndex = playedCell.substring(4);
    for (let i = 0; i < board[columnIndex].length; i++) {
      if (board[columnIndex][i] == 0) { //verif si la case est jouable
        board[columnIndex][i] = player.socketId;
        playedCell = `${columnIndex}-${i}`;
        console.log(playedCell)
        player.playedCell = playedCell;
        document.getElementById(`${playedCell}`).classList.add("team");
        player.win = getWinner(columnIndex, playedCell.substring(2));
        break;
      }
    }
    player.turn = false;
    removeListener(columns);
    socket.emit("play", player);

    if (player.win) {
      // game.classList.add('none');
      info.classList.add('none')
      victory.classList.remove('none');
      document.getElementById('h2').innerHTML = 'Vous avez gagné';
      removeListener(columns);
    }
  }
}

// columns.forEach((column) => {
//   column.onclick = function () {
//     let playedCell = this.getAttribute("id");
//     console.log(player.turn);
//     console.log(playersInRoom)
//     socket.emit("info");
//     if (player.turn === true) {
//       let columnIndex = playedCell.substring(4);
//       for (let i = 0; i < board[columnIndex].length; i++) {
//         if (board[columnIndex][i] == 0) { //verif si la case est jouable
//           board[columnIndex][i] = player.socketId;
//           playedCell = `${columnIndex}-${i}`;
//           console.log(playedCell)
//           player.playedCell = playedCell;
//           document.getElementById(`${playedCell}`).classList.add("team");
//           player.win = getWinner(columnIndex, playedCell.substring(2));
//           break;
//         }
//       }
//       player.turn = false;
//       socket.emit("play", player);

//       if (player.win) {
//         // game.classList.add('none');
//         info.classList.add('none')
//         victory.classList.remove('none');
//         document.getElementById('h2').innerHTML = 'Vous avez gagné';
//       }
//     }
//   };
// });

socket.on("play", (ennemyPlayer, cellsPlayed) => {
  if (ennemyPlayer.socketId !== player.socketId && !ennemyPlayer.turn) {
    columcell = ennemyPlayer.playedCell.substring(0, 1);
    for (let i = 0; i < board[columcell].length; i++) {
      if (board[columcell][i] == 0) {
        board[columcell][i] = ennemyPlayer.socketId;
        let playedCell = `${columcell}-${i}`;
        player.playedCell = playedCell;
        document.getElementById(`${playedCell}`).classList.add("danger");
        break;
      }
    }
    player.turn = true;
    addListener(columns);
    if (ennemyPlayer.win) {
      // game.classList.add('none');
      info.classList.add('none')
      victory.classList.remove('none');
      document.getElementById('h2').innerHTML = 'Vous avez perdu';
      removeListener(columns);
    }
  }

  if (cellsPlayed === 42 && !player.win && !ennemyPlayer.win) {
    // game.classList.add('none');
    info.classList.add('none')
    victory.classList.remove('none');
    removeListener(columns);
  }

});

socket.on("join room", (roomId) => {
  player.roomId = roomId;
});

socket.on("start game", (players) => {
  playersInRoom = players;
  console.log(players);
  startGame(players);
});

socket.on('play again', (players, enemyWantRestart = false) => {
  console.log('socket play again')
  if (players) {
    player = players.find((p) => p.socketId == player.socketId);
  }
  console.log(enemyWantRestart)
  if (enemyWantRestart && !player.wantRestart) {
      wantReplay.style.display = 'contents';
  }
  restartGame(players);
})


socket.on('refreshRoom', (p) => {
  // ennemyPlayer = players.find((p) => p.socketId != player.socketId)
  playersInRoom.find((p) => p.socketId != player.socketId) = p;
});

function restartGame(players = null, clicked = false) {
  if (!players) {
    player.wantRestart = false;
    if (clicked === true) {
      player.wantRestart = true;
      restartButton.classList.add('none');
      waitingEnemy.classList.remove('none');
    }
    socket.emit('play again', player);
  }

  if (players) {
    if (players.length === 2) {
      startGame(players);
    }
  }
}

function startGame(players) {
  table();
  playersInRoom = players;
  player = players.find((p) => p.socketId == player.socketId)
  header.style.display = 'none';
  info.classList.remove('none');
  game.classList.remove("none");
  wantReplay.style.display = 'none';
  victory.classList.add('none');
  restartButton.classList.remove('none');
  waitingPlayer.classList.add('none');
  waitingEnemy.classList.add('none');

  ennemyPlayer = playersInRoom.find((p) => p.socketId != player.socketId);
  if (player.turn) {
    addListener(columns);
  }
  
  setInterval(timestamp, 1000);
  document.getElementById('player1').innerHTML = player.username;
  document.getElementById('player2').innerHTML = ennemyPlayer.username;

}
let timestampz = Date.now() + 20000;

function timestamp() {
  console.log('timestamp')
  let currentTime = Date.now();
  let timer = round(timestampz - currentTime) / 1000
  console.log(timer)
  if (timer < 0) {
  console.log('oui')
  } else {
    if (player.turn) {
      player1Timer.innerHTML = timer;
    } else {
      player2Timer.innerHTML = timer;
    }
  }
}

function round(num) {
  return Math.round(num / 100) * 100;
}

function getWinner(columcell, cell) {
  let equal = 0;
  //vertical
  for (let i = 0; i < board[columcell].length; i++) {
    board[columcell][i] == player.socketId ? equal++ : (equal = 0);
    if (equal >= 4) {
      equal = 0;
      return true;
    }
  }

  //horizontal
  for (let i = 0; i < board.length; i++) {
    board[i][cell] == player.socketId ? equal++ : (equal = 0);
    if (equal >= 4) {
      equal = 0;
      return true;
    }
  }

  //diagonale

  equal = 0;
  let columnIndex = parseInt(columcell) - parseInt(cell);
  for (
    let i = Math.max(columnIndex, 0);
    i <= Math.min(board[columcell].length, board.length + columnIndex);
    i++
  ) {
    board[i][i - columnIndex] == player.socketId ? equal++ : (equal = 0);
    if (equal >= 4) {
      equal = 0;
      return true;
    }
  }

  // diagonale opposé
  equal = 0;
  columnIndex = parseInt(columcell) + parseInt(cell);
  for (
    let i = Math.max(columnIndex - board.length + 1, 0);
    i <= Math.min(board[columcell].length, columnIndex + 1);
    i++
  ) {
    board[i][columnIndex - i] == player.socketId ? equal++ : (equal = 0);
    if (equal >= 4) {
      equal = 0;
      return true;
    }
  }
}

// generation du tableau
function table(rows = 6, columns = 7) {
  board = [];
  for (let i = 0; i < columns; i++) {
    board[i] = Array(rows).fill(0);
    for (let j = 0; j < rows; j++) {
      let cellToClear = `${i}-${j}`;
      document.getElementById(`${cellToClear}`).classList.remove('danger', 'team');
    }
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
