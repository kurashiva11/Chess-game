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
var your_coins = "white";

var pieceCoins = {
    "♜" : "black rock",
    "♞" : "black knight",
    "♝" : "black bishop",
    "♛" : "black queen",
    "♚" : "black king",
    "♟" : "black pawn",
    "♖" : "white rock",
    "♘" : "white knight",
    "♗" : "white bishop",
    "♕" : "white queen",
    "♔" : "white king",
    "♙" : "white pawn",
    
    "black rock" : "♜",
    "black knight" : "♞",
    "black bishop" : "♝",
    "black queen" : "♛",
    "black king" : "♚",
    "black pawn" : "♟",
    "white rock" : "♖",
    "white knight" : "♘",
    "white bishop" : "♗",
    "white queen" : "♕",
    "white king" : "♔",
    "white pawn" :"♙"
}

$("#exampleModalCenter").on('hide.bs.modal', function () {          // before hide
    if(inputName.value === "" || inputName==undefined){             // validation check.
        alert("please provide your name");
        $("#exampleModalCenter").on('hidden.bs.modal', function () {
            if(inputName.value === "" || inputName==undefined)
                document.querySelector('.start').click();
        });
    }
});


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
            roomID = user.room;
            li[0].textContent = user.name;
            document.querySelector('.start').click();               //to remove the login form.
            socket.emit('newPlayer', {
                name: user.name,
                room: user.room
            }, function(opponent){
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
        // complete below by doing simple maths add,subract, etc.
    var check = {
        "rock": function(){
            console.log("from check func");

        },
        "knight": function(){
            console.log("from check func");
        },
        "bishop": function(){
            console.log("from check func");
        },
        "queen": function(){
            console.log("from check func");
        },
        "king": function(){
            console.log("from check func");
        },
        "pawn": function(){
            console.log("from check func");
        }
    }

    function checkMoveValidity(){
        var pieceName = pieceCoins[move["piece"]].split(" ")[1];
        console.log(check[pieceName]);
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
        if( (cell.text() != "") && (pieceCoins[cell.text()].split(" ")[0] !== your_coins) ){
            return;
        }
        if(move["present"] == cell.attr("id")){                                                //deselected, reseting move, select will get into its state.
            disableMovements();
            cell.removeClass("selected");
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
            cell.addClass("selected");
            enableMovements();
        } else {
            move["move_to"] = cell.attr("id");
            disableMovements();
            console.log(move);

//must check if possible to move, like queen jumps over all coins to checkmate opponent king.
            checkMoveValidity();
            moveCoin(move.present, move.move_to);
            socket.emit("createMove", move);

            $("#" + move.present).removeClass("selected");
            move = {                                                                            //reset move after pushing to backend.
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

socket.on("opponent-disconnected", function(delPlayer){
    alert(`Your ${delPlayer.name} left the match, you won`);
    location.reload(true);
});

socket.on('disconnect', function(){
    console.log("disconnected from server.");
    alert("disconnected from server your network might be slow.");
});
