var socket = io();

socket.on('connect', function(){
    console.log("connected to server");
});

document.querySelector('.start').click();
var inputName = document.querySelector(".login-name");
var submit = document.querySelector(".join");
var sendText = document.querySelector(".send-text");
var inText = document.querySelector(".text");
var li = document.querySelectorAll('.player');
var roomID = undefined;

submit.addEventListener('click', function(e){


    if(inputName.value === "" || inputName==undefined){             // validation check.
        alert("please provide your name");
        return;
    }
    socket.emit('createPlayer', {
        name: inputName.value
    }, function(user){
        if(user){                                                   //checks if user already exist in database.
            // roomID.textContent = user.room;
            roomID = user.room;
            li[0].textContent = user.name;
            document.querySelector('.start').click();               //to remove the login form.
            socket.emit('newPlayer', {
                name: user.name,
                room: user.room
            }, function(opponent){
                console.log(opponent);
                if(opponent){
                    li[1].textContent = opponent.name;
                } else {
                    console.log("waiting for an opponent");
                }
            });
        } else {
            alert("Player Already exist.");
        }

    });

});

sendText.addEventListener('click', function(e){
    e.preventDefault();
    var msg = inText.value;
    inText.value = ""
    if(!msg){
        alert("please enter your message");
        return;
    }
    socket.emit("createMessage", {
        name: li[0].textContent,
        room: roomID,
        text: msg
    });
});

socket.on('newPlayer', function(player){
    li[1].textContent = player.name;
});

socket.on("newMessage", function (message){
    var popover = $(".btnpop")
    popover.attr('data-content', message);
    
    popover.click();
    setTimeout(function(){
        popover.click();
    }, 1000);
});


socket.on('disconnect', function(){
    console.log("disconnected from server.");
});
















































    // socket.on("newMove", function (move){
    //     console.log("new Move", move);
    // });

    // socket.emit("createMove", {
    //     name: myName,
    //     room: myRoom,
    //     move: {piece: "pawns", from_positio: [0,0], to_position: [1, 1]}
    // });