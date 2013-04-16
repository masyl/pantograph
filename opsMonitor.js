/**
 * Monitor for Operations per Seconds using High Resolution Timers
 * Author: Mathieu Sylvain
 */

module.exports = function opsMonitor(label, timerInterval, fn, logger) {
	var timerSince = 0;
	var timerCycles = 0;
	var timerAccumulated = 0;

	return function () {
		var before = process.hrtime();
		fn.call(this, monitorCallback);
		function monitorCallback() {
			var now = Date.now();
			var diff = process.hrtime(before);
			var timespan = diff[0] * 1e9 + diff[1];
			timerAccumulated = timerAccumulated + timespan;
			timerCycles++;
			var perCycle = timerAccumulated / timerCycles;
			var msPerCycle = perCycle / 1000000;
			var ops = parseInt(1000000000 / perCycle);
			if (now - timerSince > timerInterval) {
				if (logger) {
					logger({
						ops: ops,
						msPerCycle: msPerCycle
					});
				}
				console.log(label, " : ", ops, "ops - ", msPerCycle, "ms");
				// Reset timer markers
				timerSince = now;
				timerAccumulated = timerCycles = 0;
			}
		}

	}

}