import io from 'socket.io-client/dist/socket.io';
import ntp from 'socket-ntp/client/ntp';

const socket = io('http://localhost:3000');

socket.emit("test", "hey");

ntp.init(socket);

setTimeout(() => {
    console.log(ntp.offset())
}, 1500); 