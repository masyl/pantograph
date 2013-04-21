
var events = require('events');
var util = require('util');
var Macros = require("./macros");
var latencyMonitor = require("./latencyMonitor");

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

    return connection;
};


// An instance of a pantograph connection(a screen)
function Connection(socket, model) {
    var connection = this;
    this.socket = socket;
    this.model = model;
    // Create a new set of macros and attach them to the pantograph instance
    this.macros = new Macros().attach(this);

    latencyMonitor(socket);

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

}

util.inherits(Connection, events.EventEmitter);





module.exports = Pantograph;


