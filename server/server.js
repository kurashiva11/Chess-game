const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log("new user connected");

    socket.emit('newPlayer', {
        from: "admin",
        text: "Welcome to Chess-game",
        createAt: new Date().getTime()
    });

    socket.emit("newMessage", {
        from: 'admin',
        text: "see you then",
        createdAt: new Date().getTime()
    })

    socket.on("createMessage", (message) => {
        console.log("createMessage", message);
    });

    socket.on('disconnect', () => {
        console.log("user disconnected");
    });
});



server.listen(port, () => {
    console.log(`server is up on ${port}`);
});