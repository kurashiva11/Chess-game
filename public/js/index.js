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
var opponentStack = $(".opponentLostCoins");
var myStack = $(".myLostCoins");

var roomID = undefined;
var your_coins = "white";
var opponent_coins = "black";
var myTurn  = false;
var id;

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
                    play();                                         //start playing only after 2 players have arraived.
                } else {
                    myTurn = true;                                  // "waiting for an opponent"
                    $(".loading").click();                          //to start waiting for opponent
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
    document.querySelector(".loading").click();     //remove loading.
    Timer.start();
    play();
});

socket.on("newMessage", function (message){
    var popover = $(".btnpop")
    popover.attr('data-content', message);
    
    popover.click();
    setTimeout(function(){
        popover.click();
    }, 1500);
});

var Timer = {
    start : function(){
        this.progressTimer = $(".progressTimer").progressBarTimer({
            autostart: false,
            timeLimit: 120,
            warningThreshold: 80,
            warningStyle: 'bg-danger',
            completeStyle: 'bg-success',
            smooth: false,
            striped: true,
            animated: true,
            height: 10,
            label: {
                show: true,
                type: 'seconds'
            },
            onFinish: function(){
                socket.emit("opponentWin", {room: roomID});
                alert("Timeout, sorry opponent Wins");
                location.reload();
            }
        });
    },
    stop : function(){
        console.log("stop");
        this.progressTimer.stop();
        $(".timeContainer").html("<div class='progressTimer'>  </div>"); //reset.
    }
};

function play(){
    var selected = false;
    var move = {
        name: li[0].textContent,
        room: roomID,
        piece: "",
        present: "",
        move_to: ""
    }

    function Char(ele){                                                     //return char of for an ascii value, works only for 0 to 9 chars.
        return "" + (ele-48);
    }

    var check = {
        "rock": function(){
            var frm = move.present, to = move.move_to;
            if( (frm.charCodeAt(0)===to.charCodeAt(0)) || (frm.charCodeAt(1)===to.charCodeAt(1)) ) {
                if(frm.charCodeAt(0)===to.charCodeAt(0)) {
                    for(var i=frm.charCodeAt(1); i!=to.charCodeAt(1) && (i<57) && (i>48); ) {
                        i = ((to.charCodeAt(1) - frm.charCodeAt(1))>=0) ? i+1 : i-1;
                        if(i == to.charCodeAt(1))                                                 //might be a kill event.
                            return true;
                        if($("#" + frm.charAt(0) + Char(i)).text() != ""){
                            console.log("as there is some obstacle");
                            return false;
                        }
                    }
                } else {
                    for(var i=frm.charCodeAt(0); (i!=to.charCodeAt(0)) && (i<57) && (i>48); ) {
                        i = ((to.charCodeAt(0) - frm.charCodeAt(0))>=0) ? i+1 : i-1;
                        if(i == to.charCodeAt(0))
                            return true;
                        if($("#" + Char(i) + frm.charAt(1)).text() != ""){
                            console.log("as there is some obstacle");
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        },
        "knight": function(){
            var frm = move.present, to = move.move_to;
            if( ( (Math.abs(frm.charCodeAt(0)-to.charCodeAt(0))===1) && (Math.abs(frm.charCodeAt(1)-to.charCodeAt(1))===2) ) || ( (Math.abs(frm.charCodeAt(0)-to.charCodeAt(0))===2) && (Math.abs(frm.charCodeAt(1)-to.charCodeAt(1))===1) ) ) {
                return true;
            }
            return false;
        },
        "bishop": function(){
            var frm = move.present, to = move.move_to;
            if( Math.abs( frm.charCodeAt(0) - to.charCodeAt(0) ) === Math.abs( frm.charCodeAt(1) - to.charCodeAt(1) ) ) {
                for(var i=frm.charCodeAt(0), j=frm.charCodeAt(1); ((i!=to.charCodeAt(0)) && (j!=to.charCodeAt(1))) && (i<57) && (i>48) && (j<57) && (j>48); ) {
                    i = (frm.charCodeAt(0)<=to.charCodeAt(0)) ? i+1 : i-1;
                    j = (frm.charCodeAt(1)<=to.charCodeAt(1)) ? j+1 : j-1;
                    if((i==to.charCodeAt(0)) && (j==to.charCodeAt(1))){
                        return true;                                                                                                                                // it might be a kill event.
                    }
                    if( $("#" + Char(i) + Char(j)).text() != "" ){
                        console.log("there is an obstacle");
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
        "queen": function(){
            if(this.rock() || this.bishop())
                return true;
            return false;
        },
        "king": function(){
            var frm = move.present, to = move.move_to;
            var xchange = Math.abs( frm.charCodeAt(0) - to.charCodeAt(0) );
            var ychange = Math.abs( frm.charCodeAt(1) - to.charCodeAt(1) );
            if( (xchange===0 || xchange===1) && (ychange===0 || ychange===1) )
                return true;
            return false;
        },
        "pawn": function(){
            var frm = move.present, to = move.move_to;
            var xchange = frm.charCodeAt(0) - to.charCodeAt(0);                           //it should only move in one direction.
            var ychange = Math.abs( frm.charCodeAt(1) - to.charCodeAt(1) );
            if( (frm.charCodeAt(0) === 55) && (ychange===0) && (xchange===2) )           //first Move.
                return true;
            if( (ychange === 0) && (xchange===1) )                                         //other Moves.
                return true;
            return false;
        }
    }

    function checkMoveValidity(){
        var pieceName = pieceCoins[move["piece"]].split(" ")[1];
        return check[pieceName]();
    }

    function moveCoin(mfrom, mto){
        var mfrm = $('#'+mfrom);
        var mt = $('#'+mto);
        mt.text(mfrm.text());
        mfrm.text("");

        // myTurn = false;
        // Timer.stop();
        socket.emit("opponentTurn", {room: roomID});                       //once coin is moved we have to toggle move.
    }

    function convertMoveAsOpponent(str){
        var res = "";

        res += (9 - ( str.charCodeAt(0) - 48));
        res += (9 - ( str.charCodeAt(1) - 48));
        return res;
    }
    
    //take global var for turn and make true and false from backend.

    $(".square").click(function() {
        console.log("square : ", myTurn);
        if(myTurn) {
            var cell = $($(this)[0]);
            if( !selected && cell.text()=="" ){                 //invalid as there is an element in that position and also select should not change
                return;
            }
            if( !selected && (cell.text() != "") && (pieceCoins[cell.text()].split(" ")[0] !== your_coins) ){        // not yet selected and selected opponent coin, trying to move opponent coin
                return;
            }
            if(move["present"] == cell.attr("id")){                                                //deselected, reseting move, select will get into its state.
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
            } else {
                move["move_to"] = cell.attr("id");

                if( cell.text()!="" && pieceCoins[cell.text()].split(' ')[0] === your_coins ){
                    console.log("its your coin can't override");
                    return;
                }

                if(pieceCoins[move["piece"]] === your_coins+" pawn"){
                    var px = move["present"].charCodeAt(0), py = move["present"].charCodeAt(1);
                    var nx = move["move_to"].charCodeAt(0), ny = move["move_to"].charCodeAt(1);
                    if( cell.text()!="" && ((px-nx)==1) && (Math.abs(ny-py)==1) ){                  //emit kill.
                        console.log("pawn kill, emit");
                        opponentStack.html( `<p>${$('#'+move["move_to"]).text()}</p>` + opponentStack.html() );
                        console.log( `<p>${$('#'+move["move_to"]).text()}</p>` + opponentStack.html() );
                        moveCoin(move.present, move.move_to);
                        socket.emit("killCoin", move);
                    }
                }

                if(checkMoveValidity()){
                    if( cell.text()!="" && pieceCoins[move["piece"]] !== your_coins+" pawn"){
                        console.log("other coin kill, emit");
                        opponentStack.html( `<p>${$('#'+move["move_to"]).text()}</p>` + opponentStack.html() );
                        console.log( `<p>${$('#'+move["move_to"]).text()}</p>` + opponentStack.html() );
                        moveCoin(move.present, move.move_to);
                        socket.emit("killCoin", move);
                    } else if( cell.text()=="" ) {
                        console.log("coin moving");
                        moveCoin(move.present, move.move_to);
                        socket.emit("createMove", move);
                    }
                }
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
        }
    });

    socket.on("newMove", function (opponentMove){
        moveCoin(convertMoveAsOpponent(opponentMove.present), convertMoveAsOpponent(opponentMove.move_to));
    });

    socket.on("killedCoin", function(opponentMove){
        console.log("opponent killed your coin");
        //show a stack kind bar and insert your coin in it.(pointer-event:none, curser:pointer)
        myStack.html( `<p>${$('#'+convertMoveAsOpponent(opponentMove["move_to"])).text()}</p>` + myStack.html() );
        console.log( `<p>${$('#'+convertMoveAsOpponent(opponentMove["move_to"])).text()}</p>` + myStack.html() );
        moveCoin(convertMoveAsOpponent(opponentMove.present), convertMoveAsOpponent(opponentMove.move_to))
    });

    socket.on("myMove", function(data){
        myTurn = !myTurn;
        if(myTurn)
            Timer.start();
        else
            Timer.stop();
    });

    socket.on("YouWin", function(data){
        alert("Congratulation!!!, you won the game");
        location.reload();
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
