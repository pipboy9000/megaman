const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ntp = require('socket-ntp');

app.use(express.static('public'))

var port = process.env.PORT || 3000;

io.on('connection', function (socket) {

    console.log('a user connected');

    ntp.sync(socket);

    socket.on("update_player", function (player) {
        // sending to all clients except sender
        socket.broadcast.emit("set_player", player);
    })
});

http.listen(port, function () {
    console.log('listening on *:3000');
});