
function distance(point1, point2) {
	return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) );
};

function angle(point1, point2) {
	var angle = Math.atan2(point1.x - point2.x, point1.y - point2.y) * (180 / Math.PI);
	if(angle < 0) angle = Math.abs(angle);
	else angle = 360 - angle;
	return angle;
};

module.exports = {
	distance: distance,
	angle: angle
};
