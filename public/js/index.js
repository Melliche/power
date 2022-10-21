
const socket = io();

const player = {
    host: false,
    roomId: null,
    username: "",
    socketId: "",
};


boite = document.getElementById('box');

boite.addEventListener("click", function(e) {
    // e.preventDefault();
    console.log('clickonboite')    
    socket.emit('play', );
});


socket.on('play', () => { 
    console.log('efefe')
    boite.style.display = 'none';
});

// console.log('index')