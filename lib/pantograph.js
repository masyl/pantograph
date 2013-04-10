var events = require('events');
var util = require('util');

function Pantograph(controller) {
	if ( !(this instanceof Pantograph) ) 
		return new Pantograph(controller);

    this.controller = controller;
	return this;
}

util.inherits(Pantograph, events.EventEmitter);

// Create a new connection to a remote pantograph
Pantograph.prototype.connect = function (socket, model) {
    var connection = new Connection(socket, model);
    this.controller.call(connection);


    // Listen for mouse events
    socket.on("mouse", function (data) {
        connection.emit("mouse", data);
    })

    // Listen for mouse events
    socket.on("mouseUp", function (data) {
        connection.emit("mouseUp", data);
    })

    // Listen for mouse events
    socket.on("mouseDown", function (data) {
        connection.emit("mouseDown", data);
    })

    return connection;
};


// An instance of a pantograph connection(a screen)
function Connection(socket, model) {
    this.socket = socket;
    this.model = model;
}

util.inherits(Connection, events.EventEmitter);

// Execute funex macros on the remote pantograph
Connection.prototype.exec = function (macro, model, callback) {
    var data = {
        macro: macro,
        model: model
    };
    this.socket.emit("exec", data, callback);
    return this;
};

module.exports = Pantograph;


