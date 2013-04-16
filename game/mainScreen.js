
var Pantograph = require('../lib/pantograph');
var MuteButton = require('./component-mute.js');

var gridSize = 16;

var mainScreen = Pantograph(function () {
	var p = this; // Self reference to the pantograph instance
	var game = p.model.game;
	var player = p.model.player;

	console.log("New player connected!");

	// Define a macro to create a new cursor
	// p.macros.new("createOwnCursor", "new('bitmap').id(id).src(uri).hide()");

	// Define a macro to move a cursor
	// p.macros.new("moveCursor", "select(id).move(x, y)");

	// Define a macro to create a new cursor
	// p.macros.new("deleteCursor", "select(id).delete()");

	game.on("connect", function (player) {
		// console.log("Player sees other player join!", player);
		// Create a remote cursor
		createCursor(player);
	});


	var mMoveCursor = p.macros.new("move-cursor", "p.select('cursors').select(id).move(x, y)");
	game.on("moveCursor", function (player) {
		// console.log("Player has moved: ", player.x, player.y);
		// Move the remote cursor
		mMoveCursor.run({
			id: 'cursor-' + player.id,
			x: player.cursorX,
			y: player.cursorY
		});
	});

	var mDeleteCursor = p.macros.new("delete-cursor", "p.select('cursors').select(id).delete()");
	game.on("disconnect", function (player) {
		console.log("Player sees other player leave!");
		// Delete the remote cursor
		mDeleteCursor.run({
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

	// todo: Dont use socket directly
	p.socket.on('movePlayer', function (data) {
		console.log(data);
	});

	// Start listening to the remote mouse signal
	p.on('mouse', function (data) {
		// Move the player cursor when the mouse signal is received
		// It will later be caugt from the Game's event emiter
		game.moveCursor(player.id, data.x, data.y);
	});

	// Start listening to the remote mouse signal
	p.macros.new("place-sound", "p.audio.sound('place').play()");
	p.on('mouseUp', function (data) {
		game.moveCursor(player.id, data.x, data.y);
		game.placeBobomb(data.x, data.y);
		p.macros.get("place-sound").run();
	});

	// Start listening to the remote mouse signal
	p.on('mouseDown', function (data) {
		game.moveCursor(player.id, data.x - 1, data.y + 3);
	});

	var mRemoveBomb = p.macros.new("remove-bomb",
		"p.select('bobombs').select(id).delete()");
	function removeBomb(bobomb) {
		mRemoveBomb.run({
			id: "sprite-" + bobomb.id
		});
	}

	// Create the remote cursors for each player
	function createCursors(players) {
		for (var key in players) {
			createCursor(players[key]);
		}
	}

	var mCreateCursor = p.macros.new("create-cursor",
		"p.Bitmap(id).src(uri).reg(10, 10).move(x, y).addTo(p.select('cursors'))");
	function createCursor(_player) {
		// Change the cursor color depending if it is the current player
		var url = (_player === player) ? "images/cursor.png" : "images/cursor2.png";
		mCreateCursor.run({
			id: 'cursor-' + _player.id,
			uri: url,
			x: _player.cursorX,
			y: _player.cursorY
		});
	}



	// Create the remote cursors for each player
	function createPlayers(players) {
		for (var key in players) {
			createPlayer(players[key]);
		}
	}


	var mCreatePlayer = p.macros.new("create-player",
		"p.Animation(id).sprite(sprite).move(x, y).addTo(p.select('players')).loop().play('spinning')");
	function createPlayer(_player) {
		// Change the cursor color depending if it is the current player
		mCreatePlayer.run({
			id: 'player-' + _player.id,
			x: _player.x * gridSize,
			y: _player.y * gridSize,
			// speed: 300,
			loop: true,
			sprite: {
				images : ["images/timmy.png"],
				frames: {
					width: 24,
					height: 32,
					count: 99,
					regX: 12,
					regY: 30
				},
				animations: {
					spinning: {
						frames: [0, 1, 2, 3, 4, 5, 6, 7],
						frequency: 8
					}
				}
			}

		});

	}


	function createBombs(bobombs) {
		for (var key in bobombs) {
			createBomb(bobombs[key]);
		}
	}

	var mCreateBomb = p.macros.new("create-bomb",
		"p.Animation(id).sprite(sprite).move(x, y).addTo(p.select('bobombs')).speed(speed).loop(loop).play('idle')");

	// todo: reuse spritesheet definition
	function createBomb(bobomb) {
		mCreateBomb.run({
			id: 'sprite-' + bobomb.id,
			x: bobomb.x,
			y: bobomb.y,
			// speed: 300,
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


	p.macros.new("show-explosion", [
		"p.Animation(id).sprite(sprite).move(x, y).addTo(p.select('explosions')).play('explode')",
		"p.audio.sound('boom').play()"
		]);

	function showExplosion(bobomb) {
		p.macros.get("show-explosion").run({
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

	/* Register audio files */
	p.macros.new("register-sounds",
		"p.audio.register(id, url)")
		.run([
			{ id: 'ambiance', url: "sounds/Ozzed_-_Here_Comes_the_8-bit_Empire.mp3" },
			{ id: 'boom', url: "sounds/MediumExplosion8-Bit.ogg" },
			{ id: 'place', url: "sounds/Thip.ogg" }
			]);

	/* Setup sprite containers */
	p.macros.new("setup-sprite-containers",
		"p.Container(id).addTo(p)")
		.run([
			{id: "players"},
			{id: "bobombs"},
			{id: "explosions"},
			{id: "ui"},
			{id: "cursors"}
			]);

	/* Setup keyboard and mouse events */
	p.macros.new("setup-keyboard-mappings", [
		"p.keyboard.map('left, right, bottom, top', 'movePlayer')",
		])
		.run();
	p.macros.new("setup-cursor-tracking",[
		"p.mouse().start()",
		"p.cursor().hide()"
		])
		.run();

	/* Start ambiance soundtrack, and defer playback if needed */
	p.macros.new("strart-soundtrack",
		"p.audio.sound('ambiance').loop(true).setVolume(0.2)")
		.run();

	var muteButton = new MuteButton().place(p);

	/* Draw initial set of bombs and the players cursors */
	createPlayers(game.players);
	createCursors(game.players);
	createBombs(game.bobombs);
});


module.exports = mainScreen;

