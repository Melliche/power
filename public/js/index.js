
const socket = io();

const player = {
    host: false,
    roomId: null,
    username: '',
    socketId: '',
    turn: false,
    playedCell: '',
};

const form = document.getElementById('form');
const input = document.getElementById('input');
const boite = document.getElementById('box');
const cell = document.getElementsByClassName('cell');

const check = document.getElementById('check');

const roomsCard = document.getElementById('rooms-card');
const roomsList = document.getElementById('rooms-list');

const game = document.getElementById('game');
const blue = document.getElementById('blue');

socket.emit('get rooms');

socket.on('list rooms', (rooms) => {
    html = '';
    if (rooms.length > 0) {
        console.log('rooms')
        rooms.forEach(room => {
            if (room.players.length !== 2) {
                html += `<li class="room">
                <p class="p-room">Salon de ${room.players[0].username} - ${room.id}</p>
                <button class="join-room" data-room="${room.id}">Rejoindre</button>
             </li>`;
            }
        });
    }
    if (html !== "") {
        console.log('roomzs')
        roomsCard.style.display = 'contents';
        roomsList.innerHTML = html;

        for (const element of document.getElementsByClassName('join-room')) {
            element.addEventListener('click', joinRoom, false)
        }
    }
})

form.addEventListener('submit', function(e) {
    e.preventDefault();

    player.username = input.value;
    player.socketId = socket.id;
    player.host = true;
    player.turn = true;
    roomsCard.style.display = 'none';
    roomsList.style.display = 'none';

    socket.emit('playerData', player);

});


// for (const celle of cell) {
//     // box.addEventListener('click', function onClick() {
//     //   console.log('box clicked');
//     // });
//     cell.addEventListener("click", function(e) {

//         const playedCell = this.getAttribute('id');
//         console.log(playedCell)
//         if (this.innerText === "" && player.turn) {
//             player.playedCell = playedCell;
//         }
        
//         console.log('clickonboite')    
//         socket.emit('play', player.roomId);
//     });
//   }
// console.log(cell)

cell.addEventListener("click", function(e) {

    const playedCell = this.getAttribute('id');
    console.log(playedCell)
    if (this.innerText === "" && player.turn) {
        player.playedCell = playedCell;
    }
    
    console.log('clickonboite')    
    socket.emit('play', player.roomId);
});

check.addEventListener("click", function(e) {
    console.log(player)
    table();
});

// socket.on('play', () => { 
//     boite.style.display = 'none';
// });

socket.on('play', (ennemyPlayer) => {
console.log('playeee')
    if (ennemyPlayer.socketId !== player.socketId && !ennemyPlayer.turn) {
        const playedCell = document.getElementById(`${ennemyPlayer.playedCell}`);

        playedCell.classList.add('danger');
        // playedCell.innerHTML = 'O';

    }
});

socket.on('join room', (roomId) => {
    player.roomId = roomId;
});

socket.on('start game', (players) => {
    console.log(players)
    startGame(players);
});

function startGame(players) {

    const ennemyPlayer = players.find(p => p.socketId != player.socketId);
    ennemyUsername = ennemyPlayer.username;



    // if (player.host && player.turn) {
    //     setTurnMessage('alert-info', 'alert-success', "C'est ton tour de jouer");
    // } else {
    //     setTurnMessage('alert-success', 'alert-info', `C'est au tour de <b>${ennemyUsername}</b> de jouer`);
    // }
}

// Quand un joueur rejoins une room et qu'il n'est pas l'host
const joinRoom = function () {
    console.log('joinroom')
    if (input.value !== '' && input.value.length >= 3) {
        player.username = input.value;
        player.socketId = socket.id;
        player.roomId = this.dataset.room;

        socket.emit('playerData', player);

        roomsCard.style.display = 'none';
        roomsList.style.display = 'none';
    }
}

// function table(rows = 6, columns = 7) {
//     board = [];

//     for(let i = 0; i < rows; i++){
//         board[i] = Array(columns).fill(0);

//         let column = document.createElement('div')
//         column.classList.add('blue');
//         column.setAttribute('id', `row-${i}`);
//         game.appendChild(column)
//         for(let i = 0; i < columns; i++){
//             let green = document.createElement('div')
//             green.setAttribute('id', `col-${i}`);
//             green.classList.add('green', 'cell');
//             column.appendChild(green)

//         }
//     }
//     console.log(cell)

//     console.log(board)
// }
