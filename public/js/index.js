
const socket = io();

const player = {
    host: false,
    roomId: null,
    username: "",
    socketId: "",
};

const form = document.getElementById('form');
const input = document.getElementById('input');
const boite = document.getElementById('box');

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

    roomsCard.style.display = 'none';
    roomsList.style.display = 'none';

    socket.emit('playerData', player);

});

boite.addEventListener("click", function(e) {
    console.log('clickonboite')    
    socket.emit('play', player.roomId);
});

check.addEventListener("click", function(e) {
    console.log(player)
    table();
});

socket.on('play', () => { 
    boite.style.display = 'none';
});

socket.on('join room', (roomId) => {
    player.roomId = roomId;
});


// Quand un joueur rejoins une room et qu'il n'est pas l'host
const joinRoom = function () {
    console.log('joinroom')
    if (input.value !== '' && input.value.length >= 3) {
        player.username = input.value;
        player.socketId = socket.id;
        player.roomId = this.dataset.room;

        socket.emit('playerData', player);

        // userCard.hidden = true;
        // waitingArea.style.display = 'contents';
        roomsCard.style.display = 'none';
        roomsList.style.display = 'none';
    }
}

function table(rows = 6, columns = 7) {
    board = [];

    for(let i = 0; i < rows; i++){
        board[i] = Array(columns).fill(0);

        let column = document.createElement('div')
        column.classList.add('blue');
        column.setAttribute('id', 'blue');
        game.appendChild(column)
        for(let i = 0; i < columns; i++){
            let green = document.createElement('div')
            green.setAttribute('id', 'green');
            green.classList.add('green');
            column.appendChild(green)

        }
        
    }


    // let table = document.createElement('table');
    // //ATTENTION, la page html est écrite de haut en bas. Les indices 
    // //pour le jeu vont de bas en haut (compteur i de la boucle)
    // for (let i = this.rows - 1; i >= 0; i--) {
    //   let tr = table.appendChild(document.createElement('tr'));
    //   for (let j = 0; j < this.cols; j++) {
    //     let td = tr.appendChild(document.createElement('td'));
    //     let colour = this.board[i][j];
    //     if (colour)
    //       td.className = 'player' + colour;
    //     td.dataset.column = j;
    //   }
    // }


    console.log(board)
}
