const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

var Users = require("./utils/users").users;
var players = new Users();


const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log("new user connected");

    socket.on('createPlayer', (result, callback) => {
        var newplayer = players.insertUser(result.name);
        if(newplayer){
            callback(newplayer);
            socket.join(newplayer.room);

            socket.on('disconnect', () => {
                console.log("user disconnected");
                var delPlayer = players.deleteUser(newplayer.name, newplayer.room);
                if( delPlayer ){
                    io.to(newplayer.room).emit("opponent-disconnected", delPlayer);
                } else {
                    console.log("unable to delete user");
                }
            });

        } else {
            callback(undefined);
        }
    });

    socket.on('newPlayer', function(player, callback){
        var opponent = players.findOpponent(player);
        if(opponent){
            callback(opponent);
            socket.broadcast.emit('newPlayer', player);
        } else {
            callback(undefined);
        }
    });

    socket.on("createMessage", (message) => {
        socket.broadcast.to(message.room).emit("newMessage", message.text);
    });

    socket.on("createMove", function (move){
        socket.broadcast.to(move.room).emit("newMove", move);
    });

    socket.on("killCoin", function(data){
        socket.broadcast.to(data.room).emit("killedCoin", data);
    });

});



server.listen(port, () => {
    console.log(`server is up on ${port}`);
});










































    // socket.emit("newMove", {
    //     name: "kura",
    //     move: {piece: "pawns", from_positio: [0,0], to_position: [1, 1]}
    // });

    // socket.on("createMove", function (move){
    //     console.log("new Move", move);
    // });
