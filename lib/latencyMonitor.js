
var opsMonitor = require('../opsMonitor');

module.exports = function latencyMonitor(socket) {
    //todo: place latencyMonitor elsewhere (in its own module)
    function latencyCheck(monitorCallback) {
        socket.emit("latencyCheck", "ping", function (pong) {
            monitorCallback();
        });
    }
    function logLatencyBackToClient(latency) {
        socket.emit("latency", latency);
    }
    var monitorLatencyCheck = opsMonitor("latencyCheck", 3000, latencyCheck, logLatencyBackToClient);

    setInterval(monitorLatencyCheck, 100);
}
