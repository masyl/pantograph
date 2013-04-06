

var Pantograph = require('../lib/pantograph');

var mainScreen = Pantograph(function () {
	var p = this; // Self reference to the pantograph instance
	var game = p.model.game;
	var player = p.model.player;

	console.log("New player connected!");

	// Define a macro to create a new cursor
	// p.macro("createOwnCursor", "new('bitmap').id(id).src(uri).hide()");

	// Define a macro to move a cursor
	// p.macro("moveCursor", "select(id).move(x, y)");

	// Define a macro to create a new cursor
	// p.macro("deleteCursor", "select(id).delete()");

	game.on("connect", function (player) {
		console.log("Player sees other player join!", player);
		// Create a remote cursor
		createCursor(player);
	});

	game.on("move", function (player) {
		// console.log("Player has moved: ", player.x, player.y);
		// Move the remote cursor
		p.exec("p.select('cursors').select(id).move(x, y)", {
			id: 'cursor-' + player.id,
			x: player.x,
			y: player.y
		});
	});

	game.on("disconnect", function (player) {
		console.log("Player sees other player leave!");
		// Delete the remote cursor
		p.exec("p.select('cursors').select(id).delete()", {
			id: 'cursor-' + player.id
		});
	});

	game.on("boom", function (bobomb) {
		removeBomb(bobomb);
		showExplosion(bobomb);
	});

	game.on("tsss", function (bobomb) {
		createBomb(bobomb);
	});

/*

{
		id: bobomb.id,
		x: this.x,
		y: this.y,
		expiration: this.timestamp + this.fuseTimeout
	}

*/
	// Start listening to the remote mouse signal
	p.on('mouse', function (data) {
		// Move the player cursor when the mouse signal is received
		// It will later be caugt from the Game's event emiter
		game.move(player.id, data.x, data.y);
	});

	// Start listening to the remote mouse signal
	p.on('mouseUp', function (data) {
		game.move(player.id, data.x, data.y);
		game.placeBobomb(data.x, data.y);
	});

	// Start listening to the remote mouse signal
	p.on('mouseDown', function (data) {
		game.move(player.id, data.x - 1, data.y + 3);
	});

	function removeBomb(bobomb) {
		p.exec("p.select('bobombs').select(id).delete()", {
			id: "sprite-" + bobomb.id
		});
	}

	// Create the remote cursors for each player
	function createCursors(players) {
		for (var key in players) {
			createCursor(players[key]);
		}
	}
	function createCursor(_player) {
		// Change the cursor color depending if it is the current player
		var url = (_player === player) ? "images/cursor.png" : "images/cursor2.png";
		p.exec("p.Bitmap(id).src(uri).reg(9, 9).move(x, y).addTo(p.select('cursors'))", {
			id: 'cursor-' + _player.id,
			uri: url,
			x: _player.x,
			y: _player.y
		});
	}

	// Create the remote cursors for each player
	function createBombs(bobombs) {
		for (var key in bobombs) {
			createBomb(bobombs[key]);
		}
	}
	function createBomb(bobomb) {
		// Change the cursor color depending if it is the current player
		p.exec("p.Animation(id).sprite(sprite).move(x, y).addTo(p.select('bobombs')).speed(speed).loop(loop).play('idle')", {
			id: 'sprite-' + bobomb.id,
			x: bobomb.x,
			y: bobomb.y,
			speed: 300,
			loop: true,
			sprite: {
				images : ["images/bobomb-sprites.png"],
				frames: [
					// x, y, width, height, imageIndex, regX, regY
					// Idle
					[10, 60, 60, 80, 0, 22, 60],
					[70, 60, 60, 80, 0, 22, 60],
					[130, 60, 60, 80, 0, 22, 60],
					[190, 60, 60, 80, 0, 22, 60],
				],
				animations: {
					idle: {
						frames: [0, 1, 2, 3],
						frequency: 16
					}
				}
			}

		});
	}

	function showExplosion(bobomb) {
		// Change the cursor color depending if it is the current player
		p.exec("p.Animation(id).sprite(sprite).move(x, y).addTo(p.select('explosions')).play('explode')", {
			id: 'explosion-' + bobomb.id,
			x: bobomb.x,
			y: bobomb.y,
			sprite: {
				images : ["images/bobomb-sprites.png"],
				frames: [
					// x, y, width, height, imageIndex, regX, regY
					// Explode
					[280, 560, 138, 140, 0, 70, 70],
					[418, 560, 138, 140, 0, 70, 70],
					[556, 560, 138, 140, 0, 70, 70]
				],
				animations: {
					explode: {
						frames: [0, 1, 2, null],
						frequency: 3
					}
				}
			}

		});
	}

	p.exec("p.Container('bobombs').addTo(p)");
	p.exec("p.Container('explosions').addTo(p)");
	p.exec("p.Container('cursors').addTo(p)");
	p.exec("p.mouse().start()");
	p.exec("p.cursor().hide()");
	createCursors(game.players);
	createBombs(game.bobombs);
});



module.exports = mainScreen;