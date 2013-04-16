
function MuteButton() {

	this.muted = false;

}

MuteButton.prototype.place = function place(p) {
	var muteButton = this;

	// todo: simplify selection syntax ... like this
	//	p.select('ui.sound-on').hide();
	this.mUnMute = p.macros.new("unmute", function () {
		p.select('ui').select('sound-off').hide();
		p.select('ui').select('sound-on').show();
	});

	this.mMute = p.macros.new("mute", function () {
		p.select('ui').select('sound-on').hide();
		p.select('ui').select('sound-off').show();
	});


	this.mToggleMute = p.macros.new("toggle-mute", function() {
		p.audio.toggleMute();
		p.audio.getMute();
	}, function (muted) {
		muteButton.update(muted);
	})

	// todo: Dont use socket directly
	p.socket.on('mute', function () {
		//todo: simplify this sequence
		muteButton.mToggleMute.run();
	});

	p.macros.new("create-mute-button", function() {
		p.keyboard.map('m', 'mute');
		p.Bitmap('sound-on').src('images/sound.png').move(12, 10).addTo(p.select('ui'));
		p.Bitmap('sound-off').src('images/sound_muted.png').click('mute').move(10, 10).addTo(p.select('ui')).hide();
		p.select('ui').select('sound-on').click('mute', p.socket);
		p.select('ui').select('sound-off').click('mute', p.socket);
	})
	.run();

	return this;
};


MuteButton.prototype.update = function update(muted) {
	this.muted = muted;
	if (this.muted) {
		this.mMute.run();
	} else {
		this.mUnMute.run();
	}
	return this;
};



module.exports = MuteButton;
