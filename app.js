var http = require('http');
var socketio = require('socket.io');
var express = require('express');

var	app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

/*

Key concepts:
	Pentograph : A tool to draw remotely on a canvas
	Stencil : A preset functionnal macro that is used to template the behaviors asked of the client

*/

// A simple instance of a game
var Game = new require("./game");

var game = new Game();

// Start the game loop
game.start();

// A pantograph model for the main screen, which will show cursor of each players
var mainScreen = new require("./game/mainScreen");

io.set('log level', 0);

// The main connection loop used when a player connects
io.sockets.on('connection', function (socket) {
	console.log("Socket connection!");

	// Instantiate a new player in the game
	var player = game.connect(socket.id);

	// Create a simple model from the game state
	var model = {
		player: player,
		game: game
	};

	// Create a new instance of the mainScreen
	// for a specific player
	var p = mainScreen.connect(socket, model);

	// Disconnect the player when socket disconnects
	socket.on('disconnect', function () {
		console.log("Socket disconnection!");
		game.disconnect(player);
    });

});


app.use(express.static(__dirname + '/public'));
// app.use(express.logger());
var port = process.env.PORT || 8001;
server.listen(port);
console.log("Listening on port : ", port);

