const uniqID = require("uniqid");

class Users{
    constructor(){
        this.users = [];
    }

    insertUser(name){
        if(!this.findUser(name)){       //if new user
            var temp = this.assignroom();
            var newUser = {
                id: new Date().getTime(),
                name: name,
                room: temp.room,
                hasOpponent: temp.hasOpponent
            }
            this.users.push(newUser);
            return newUser;
        }
        return undefined;
    }

    findUser(name){
        for(var i=0; i<this.users.length; i++){
            if(this.users[i].name === name){
                return this.users[i].name;
            }
        }
        return undefined;
    }
    
    findOpponent(user){
        for(var i=0; i<this.users.length; i++){
            if( (this.users[i].room == user.room) && (this.users[i].name != user.name) ){
                return this.users[i];
            }
        }
        return undefined;
    }

    deleteUser(name, room){
        var len = this.users.length;
        for(var i=0; i<len; i++){
            if((this.users[i].name === name) && (this.users[i].room === room)){
                var deluser = this.users[i];
                this.users = this.users.slice( 0, i ).concat( this.users.slice(i+1, len) );
                return deluser;
            }
        }
        return undefined;
    }

    assignroom(){
        for(var i=0; i<this.users.length; i++){
            if(this.users[i].hasOpponent === false){
                this.users[i].hasOpponent = true;
                return {room:this.users[i].room, hasOpponent:true};
            }
        }
        return {room:uniqID(), hasOpponent:false};
    }
}

module.exports.users = Users;