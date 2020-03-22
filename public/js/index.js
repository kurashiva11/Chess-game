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

var pieceCoins = {
    "&#9820;" : "black rock",
    "&#9822;" : "black knight",
    "&#9821;" : "black bishop",
    "&#9819;" : "black queen",
    "&#9818;" : "black king",
    "&#9823;" : "black pawn",
    "&#9814;" : "white rock",
    "&#9816;" : "white knight",
    "&#9815;" : "white bishop",
    "&#9813;" : "white queen",
    "&#9812;" : "white king",
    "&#9817;" : "white pawn"
}

submit.addEventListener('click', function(e){
    e.preventDefault();

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
                    play();                                        //start playing only after 2 players have arraived.
                } else {
                    console.log("waiting for an opponent");
                }
            });
        } else {
            alert("Player Already exist.");
            document.querySelector('.start').click();
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
    play();
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


function play(){
    var selected = false;
    var move = {
        name: li[0].textContent,
        room: roomID,
        piece: "",
        present: "",
        move_to: ""
    }

    function enableMovements(){

    }
    function disableMovements(){

    }

    function moveCoin(mfrom, mto){
        var mfrm = $('#'+mfrom);
        var mt = $('#'+mto);
        mt.text(mfrm.text());
        mfrm.text("");
    }

    function convertMoveAsOpponent(str){
        var res = "";

        res += (9 - ( str.charCodeAt(0) - 48));
        res += (9 - ( str.charCodeAt(1) - 48));
        console.log("opponentMove:", res)
        return res;
    }

    $(".square").click(function() {
        var cell = $($(this)[0]);
        if( (!selected && cell.text()=="") || (selected && cell.text()!="") ){                 //invalid as there is no element in that position and also select should not change
            return;
        }
        if(move["present"] == cell.attr("id")){          //deselected, reseting move, select will get into its state.
            disableMovements();
            move = {
                name: li[0].textContent,
                room: roomID,
                piece: "",
                present: "",
                move_to: ""
            }
        }
        else if(!selected){
            move["piece"] = cell.text();
            move["present"] = cell.attr("id");
            enableMovements();
        } else {
            move["move_to"] = cell.attr("id");
            disableMovements();
            console.log(move);

//must check if possible to move, like queen jumps over all coins to checkmate opponent king.
            moveCoin(move.present, move.move_to);
            socket.emit("createMove", move);

            move = {                                    //reset move after pushing to backend.
                name: li[0].textContent,
                room: roomID,
                piece: "",
                present: "",
                move_to: ""
            }
        }
        selected = !selected;
    });

    socket.on("newMove", function (opponentMove){
        console.log("new Move", opponentMove);
        moveCoin(convertMoveAsOpponent(opponentMove.present), convertMoveAsOpponent(opponentMove.move_to));
        // moveCoin(opponentMove.present, opponentMove.move_to);
    });
}