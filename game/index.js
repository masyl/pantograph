/*

A sample game to demo the use of the Pantograph api

This game tracks each players cursor positions

*/

var events = require('events');
var util = require('util');

function Game() {
	this.players = {};
	this.bombCount = 0;
	this.bombs = {};
	this.speed = 300;
	this.running = false;
	this.cycle = 0;
}

util.inherits(Game, events.EventEmitter);

Game.prototype.start = function () {
	console.log("Game started!");
	this.running = true;
	this.tick();
	return this;
}

Game.prototype.stop = function () {
	this.running = false;
	return this;
}

Game.prototype.tick = function () {
	this.cycle++;
	console.log("Tick!", this.cycle);
	var game = this;
	this.testBombs();
	if (this.running) {
		setTimeout(function() {
			game.tick();
		}, this.speed);
	}
	return this;
};

Game.prototype.connect = function (id) {
	var player = new Player(id);
	this.players[id] = player;
	this.emit("connect", player);
	return player;
};

Game.prototype.disconnect = function (player) {
	delete this.players[player.id];
	this.emit("disconnect", player);
	return this;
};

Game.prototype.move = function (id, x, y) {
	var player = this.players[id];
	player.x = x;
	player.y = y;
	this.emit("move", player);
	return this;
}

function Player(id) {
	this.id = id;
	this.x = 0;
	this.y = 0;
};

function Bomb(id, x, y, fuseTimeout, timestamp) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.fuseTimeout = fuseTimeout;
	this.timestamp = timestamp;
}

Bomb.prototype.isExploded = function () {
	return (this.timestamp + this.fuseTimeout < Date.now());
}

Game.prototype.placeBomb = function(x, y) {
	console.log("Bomb placed!");
	this.bombCount++;
	var id = "bomb-" + this.bombCount;
	var bomb = new Bomb(id, x, y, 3000, Date.now());
	this.bombs[id] = bomb;
	this.emit("tsss", bomb);
	return this;
}


Game.prototype.testBombs = function() {
	var bomb;
	for (var key in this.bombs) {
		var bomb = this.bombs[key];
		if (bomb.isExploded()) {
			console.log("Boom!!!");
			delete this.bombs[key];
			this.emit("boom", bomb);
		}
	}
	return this;
}


module.exports = Game;
