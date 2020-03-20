var socket = io();

socket.on('connect', function(){
    console.log("connected to server");

    socket.on("newMessage", function (message){
        console.log("new Message", message);
    });

    socket.emit("createMessage", {
        name: "kura",
        text: "hey"
    });
});

socket.on('newPlayer', function(player) {
    console.log("new Player", player);
});

socket.on('disconnect', function(){
    console.log("disconnected from server.");
});
