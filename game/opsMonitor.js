/**
 * Monitor for Operations per Seconds using High Resolution Timers
 * Author: Mathieu Sylvain
 */

module.exports = function opsMonitor(label, timerInterval, fn) {
	var timerSince = 0;
	var timerCycles = 0;
	var timerAccumulated = 0;

	return function () {
		var before = process.hrtime();
		fn.call(this);
		var now = Date.now();
		var diff = process.hrtime(before);
		var timespan = diff[0] * 1e9 + diff[1];
		timerAccumulated = timerAccumulated + timespan;
		timerCycles++;
		var perCycle = timerAccumulated / timerCycles;
		if (now - timerSince > timerInterval) {
			console.log(label + " : ", parseInt(1000000000 / perCycle), "ops");
			timerSince = now;
			timerAccumulated = timerCycles = 0;
		}

	}

}