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
}

util.inherits(Game, events.EventEmitter);

Game.prototype.connect = function (id) {
	var player = new Player(id);
	this.players[id] = player;
	this.emit("connect", player);
	return player;
};

Game.prototype.disconnect = function (player) {
	delete this.players[player.id];
	this.emit("disconnect", player);
};

Game.prototype.move = function (id, x, y) {
	var player = this.players[id];
	player.x = x;
	player.y = y;
	this.emit("move", player);
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
	this.bombCount++;
	var id = "bomb-" + this.bombCount;
	var bomb = new Bomb(id, x, y, 2000, Date.now());
	this.bombs[id] = bomb;
	this.emit("tsss", bomb);
	return this;
}


Game.prototype.testBombs = function() {
	var bomb;
	for (var key in this.bombs) {
		var bomb = this.bombs[key];
		if (bomb.isExploded()) {
			delete this.bombs[key];
			this.emit("boom", bomb);
		}
	}
	return this;
}


module.exports = Game;
