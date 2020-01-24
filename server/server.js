var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var ntp = require('socket-ntp');

io.on('connection', function (socket) {

    console.log('a user connected');

    ntp.sync(socket);

    socket.on("update_player", function (player) {
        // sending to all clients except sender
        socket.broadcast.emit("set_player", player);
    })
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});