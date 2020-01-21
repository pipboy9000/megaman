var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var ntp = require('socket-ntp');

io.on('connection', function (socket) {

    console.log('a user connected:  ' + socket.handshake.address);
    ntp.sync(socket);

    socket.on("test", function (data) {
        console.log(data);
    })
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});