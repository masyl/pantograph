

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

	game.on("boom", function (bomb) {
		p.exec("p.select('bombs').select(id).delete()", {
			id: bomb.id
		});
	});

	game.on("tsss", function (bomb) {
		createBomb(bomb);
	});

/*

{
		id: bomb.id,
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
		game.placeBomb(data.x, data.y);
	});

	// Start listening to the remote mouse signal
	p.on('mouseDown', function (data) {
		game.move(player.id, data.x - 1, data.y + 3);
	});

	// Create the remote cursors for each player
	function createCursors(players) {
		for (var key in players) {
			createCursor(players[key]);
		}
	}
	function createCursor(_player) {
		// Change the cursor color depending if it is the current player
		var url = (_player === player) ? "images/cursor.png" : "images/cursor2.png";
		console.log("------", _player.x, _player.y);
		p.exec("p.Bitmap(id).src(uri).reg(9, 9).move(x, y).addTo(p.select('cursors'))", {
			id: 'cursor-' + _player.id,
			uri: url,
			x: _player.x,
			y: _player.y
		});
	}

	// Create the remote cursors for each player
	function createBombs(bombs) {
		for (var key in bombs) {
			createBomb(bombs[key]);
		}
	}
	function createBomb(bomb) {
		// Change the cursor color depending if it is the current player
		p.exec("p.Bitmap(id).src(uri).reg(16, 16).move(x, y).addTo(p.select('bombs'))", {
			id: 'sprite-' + bomb.id,
			uri: "images/bomb.png",
			x: bomb.x,
			y: bomb.y
		});
	}

	p.exec("p.Container('bombs').addTo(p)");
	p.exec("p.Container('cursors').addTo(p)");
	p.exec("p.mouse().start()");
	p.exec("p.cursor().hide()");
	createCursors(game.players);
	createBombs(game.bombs);
});



module.exports = mainScreen;