/*

A sample game to demo the use of the Pantograph api

This game tracks each players cursor positions

*/

var events = require('events');
var util = require('util');
var opsMonitor = require('./opsMonitor');
var lib2d = require('./lib2d');

function Game() {
	this.players = {};
	this.bobombCount = 0;
	this.bobombs = {};
	this.speed = 20;
	this.running = false;
	this.cycle = 0;
}

// High resolution timer
var timerInterval = 3000;
var timerSince = 0;
var timerCycles = 0;
var timerAccumulated = 0;





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

tick = function () {
	this.cycle++;
//	console.log("Tick!", this.cycle);
	var game = this;
	this.testBombs();
	if (this.running) {
		setTimeout(function() {
			game.tick()
		}, this.speed);
	}
	return this;
};

// Monitor the Operations Per Seconds for the main game tick
Game.prototype.tick = opsMonitor("Game.tick()", 3000, tick);

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

function Bobomb(id, x, y, fuseTimeout, timestamp) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.fuseTimeout = fuseTimeout;
	this.timestamp = timestamp;
}

Bobomb.prototype.isExploded = function () {
	return this.fuseRemain() <= 0;
}

Bobomb.prototype.fuseRemain = function () {
	return this.timestamp + this.fuseTimeout - Date.now();
}

Game.prototype.placeBobomb = function(x, y) {
	this.bobombCount++;
	var id = "bobomb-" + this.bobombCount;
	var bobomb = new Bobomb(id, x, y, 3000, Date.now());
	this.bobombs[id] = bobomb;
	this.emit("tsss", bobomb);
	return this;
}

Game.prototype.chainReaction = function(x, y) {
	var bobomb;
	var distance;
	for (var key in this.bobombs) {
		var bobomb = this.bobombs[key];
		distance = lib2d.distance({x:x, y:y}, {x:bobomb.x, y:bobomb.y});
		// todo: make chaine reaction distance configurable
		if (distance < 70) {
			var remain = bobomb.fuseRemain();
			// todo: make chain reaction delay configurable
			if (remain > 150) {
				bobomb.fuseTimeout = Date.now() - bobomb.timestamp + 150;
			}
		}
	}
	return this;
}

Game.prototype.testBombs = function() {
	var bobomb;
	for (var key in this.bobombs) {
		var bobomb = this.bobombs[key];
		if (bobomb.isExploded()) {
			// console.log("Boom!!!");
			delete this.bobombs[key];
			this.chainReaction(bobomb.x, bobomb.y);
			this.emit("boom", bobomb);
		}
	}
	return this;
}


module.exports = Game;
