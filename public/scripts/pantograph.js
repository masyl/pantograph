/*

# Dependencies
http://robertwhurst.github.io/KeyboardJS/
http://createjs.com

*/
;(function ($) {

	var mouseThrottle = 30;

	var Ticker = createjs.Ticker;
	var Stage = createjs.Stage;

	Ticker.setFPS(48);
	Ticker.addListener(window);


	function Macro(id, source) {
		var macro = this;
		this.id = id;
		this.source = source;
		this.funexes = [];
		source.forEach(function (val, i, obj) {
			macro.funexes.push(new funex(val));
		});
	}

	Macro.prototype.run = function (model) {
		var output;

		console.log("run: ", this.id, this, model);
		var output;
		this.funexes.forEach(function (val, i, obj) {
			output = val(model);
		});
		return output;
	}

	function Pantograph(socket, canvasElement) {
		var p = this;

		p.socket = socket;
		p.canvas = canvasElement;
		p.element = p.stage = new Stage(canvasElement);
		p.macros = {};

		p.audio = new Audio(p);
		p.keyboard = new Keyboard(p);

		p.socket.on("run", function (data, callback) {
			var macro = p.macros[data.macro];
			console.log(data);
			//console.log(data.macro, data.model);
			p.run(macro, data.model, callback);
		});

		p.socket.on("teach", function (data) {
			var funexArray = [];
			var macro = new Macro(data.id, data.source);
			console.log("teach", macro);
			p.macros[data.id] = macro;

		});

		p.socket.on("latency", function (data) {
			console.log("Roundtrip latency: ", data);
		});

		p.socket.on("latencyCheck", function (data, callback) {
			callback("pong");
		});

		// index of all object by their ID's
		p.all = {};


		window.tick = function tick() {
		    // update the stage:
		    p.stage.update();
		}

	};

	Pantograph.prototype.run = function (macro, model, callback) {
		// console.log("exec with callback ", callback);
		// console.info("exec", macro, model);
		var baseScope = {
			"true": true,
			"false": false,
			p: this
		};
		// Wrap the model in an array if it isn't already an array
		var _model = Array.isArray(model) ? model : [model];

		_model.forEach(function (val, i, obj) {
			var scope = [baseScope, val];
			var result = macro.run(scope);
			if (callback) {
				callback(result);
			}
		});
		return this;
	};

	Pantograph.prototype.select = function (id) {
		// console.info("select", id);
		var obj = this.all[id];
		return obj;
	};

	Pantograph.prototype.delete = function (child) {
		var p = this;
		// console.info("select", id);
		p.stage.removeChild(child.element);
		delete p.all[child.id]
		return p;
	};

	Pantograph.prototype.add = function (obj) {
		// console.info("add", obj);
		this.all[obj.id] = obj;
		obj.parent = this;
		if (obj.element) {
			this.stage.addChild(obj.element);
		}
		return this;
	};

	Pantograph.prototype.update = function () {
		// console.info("update");
		this.stage.update();
		return this;
	};

	Pantograph.prototype.mouse = function () {
		var p = this;

		function stop() {
			// console.info("mouse tracking stopped")
			p.stage.onMouseMove = null;
			return this;
		}

		function start() {


			function onMouseMove(mouseEvent) {
				if (p.stage) {
					p.socket.emit("mouse", {
						x: mouseEvent.stageX,
						y: mouseEvent.stageY
					});
				}
			};
			_onMouseMove = _.throttle(onMouseMove, mouseThrottle);
			p.stage.onMouseMove = _onMouseMove;


			p.stage.addEventListener('stagemouseup', function onMouseUp(mouseEvent) {
				// A set timeout is used here to allow stage childs to use .preventDefault()
				setTimeout(function() {
					if (!mouseEvent.nativeEvent.defaultPrevented) {
						if (p.stage) {
							p.socket.emit("mouseUp", {
								x: mouseEvent.stageX,
								y: mouseEvent.stageY
							});
						}
					}
				});
			});

			p.stage.addEventListener('stagemousedown', function onMouseDown(mouseEvent) {
				// A set timeout is used here to allow stage childs to use .preventDefault()
				setTimeout(function() {
					if (!mouseEvent.nativeEvent.defaultPrevented) {
						if (p.stage) {
							p.socket.emit("mouseDown", {
								x: mouseEvent.stageX,
								y: mouseEvent.stageY
							});
						}
					}
				});
			});

			return this;
		}

		return {
			stop: stop,
			start: start
		}

	};

	Pantograph.prototype.cursor = function () {
		var p = this;

		function show() {
			// console.info("cursor shown")
			$(p.canvas).css({
				cursor: "default"
			});
			return this;
		}

		function hide() {
			// console.info("cursor hidden")
			$(p.canvas).css({
				cursor: "none"
			});
			return this;
		}

		return {
			show: show,
			hide: hide
		}

	};


	function Bitmap(id) {
		if ( !(this instanceof Bitmap) )
			return new Bitmap(id);

		this.id = id;
		this.x = 0;
		this.y = 0;
		this.visible = true;
		this.image = null;
		this.element = null;
		this.onClick = null;
		this.parent = null;
	}

	Bitmap.prototype.src = function (uri) {
		var bitmap = this;
		bitmap.image = new Image();
		bitmap.image.src = uri;
		bitmap.image.onload = function(e){
			bitmap.element = new createjs.Bitmap(e.target);
			bitmap.update();
			if (bitmap.parent) {
				bitmap.parent.add(bitmap);
				bitmap.parent.update();
			}
			// console.info("Bitmap created:", bitmap.element);
		}
		return this;
	}

	Bitmap.prototype.delete = function () {
		this.parent.delete(this);
		return this;
	}

	Bitmap.prototype.addTo = function (parent) {
		parent.add(this);
		return this;
	}

	Bitmap.prototype.move = function (x, y) {
		this.x = x;
		this.y = y;
		this.update();
		return this;
	}

	Bitmap.prototype.reg = function (x, y) {
		this.regX = x;
		this.regY = y;
		this.update();
		return this;
	}

	Bitmap.prototype.update = function () {
		if (this.element) {
			this.element.x = this.x;
			this.element.y = this.y;
			this.element.regX = this.regX;
			this.element.regY = this.regY;
			this.element.visible = this.visible;
			if (this.clickEvent) {
				this.element.mouseEnabled = true;
				this.element.addEventListener('click', this.clickEvent);
			}
		}
		return this;
	}

	Bitmap.prototype.show = function () {
		this.visible = true;
		this.update();
		return this;
	}

	Bitmap.prototype.hide = function () {
		this.visible = false;
		this.update();
		return this;
	}

	Bitmap.prototype.click = function (eventId, eventEmmiter) {
		this.clickEvent = function (e) {
			e.nativeEvent.preventDefault();
			e.nativeEvent.stopImmediatePropagation();
			e.nativeEvent.stopPropagation();
			eventEmmiter.emit(eventId);
		}
		this.update();
		return this;
	}




	function Animation(id) {
		if ( !(this instanceof Animation) )
			return new Animation(id);

		this.id = id;
		this.x = 0;
		this.y = 0;
		this._sprite = null;
		this.element = null;
		this.parent = null;
		this.playWhenReady = null;
		this.currentSpeed = 1;
		this.looping = false;
	}

	Animation.prototype.sprite = function (data) {
		var animation = this;
		var sheet = animation._sprite = new createjs.SpriteSheet(data)
		if (!sheet.complete) {
			// not preloaded, listen for onComplete:
			sheet.addEventListener("complete", function(e) {
				animation.element = new createjs.BitmapAnimation(sheet);
				animation.element.onAnimationEnd = function (e) {
					// console.log("animation.looping : ", animation.looping);
					if (!animation.looping) animation.element.stop();
				};
				animation.update();
					// console.log("RESUME? ", animation.playWhenReady);
				if (animation.playWhenReady) {
					animation.play(animation.playWhenReady);
				}
				if (animation.parent) {
					animation.parent.add(animation);
					animation.parent.update();
				}
				// console.info("BitmapAnimation created:", bitmap.element);
			});
		}
		return this;
	}

	Animation.prototype.delete = function () {
		this.parent.delete(this);
		return this;
	}

	Animation.prototype.speed = function (_speed) {
		this.currentSpeed = _speed;
		return this;
	}

	Animation.prototype.loop = function (_loop) {
		this.looping = _loop;
		return this;
	}

	Animation.prototype.play = function (seq) {
		if (this.element) {
			this.element.speed = this.currentSpeed;
			this.element.gotoAndPlay(seq);
		} else {
			this.playWhenReady = seq;
		}
		return this;
	}

	Animation.prototype.addTo = function (parent) {
		parent.add(this);
		return this;
	}

	Animation.prototype.move = function (x, y) {
		this.x = x;
		this.y = y;
		this.update();
		return this;
	}

	Animation.prototype.reg = function (x, y) {
		this.regX = x;
		this.regY = y;
		this.update();
		return this;
	}

	Animation.prototype.update = function () {
		if (this.element) {
			this.element.x = this.x;
			this.element.y = this.y;
			this.element.regX = this.regX;
			this.element.regY = this.regY;
		}
		return this;
	}





	function Container(id) {
		if ( !(this instanceof Container) )
			return new Container(id);

		this.id = id;
		this.x = 0;
		this.y = 0;
		this.element = new createjs.Container();
		this.parent = null;

		// index of all childs by their ID's
		this.all = {};
	}

	Container.prototype.delete = function () {
		this.parent.delete(this);
		return this;
	}

	Container.prototype.addTo = function (parent) {
		parent.add(this);
		return this;
	}

	Container.prototype.move = function (x, y) {
		this.x = x;
		this.y = y;
		if (this.element) {
			this.element.x = this.x;
			this.element.y = this.y;
		}
		return this;
	}

	Container.prototype.add = function (obj) {
		// console.info("add", obj);
		this.all[obj.id] = obj;
		obj.parent = this;
		if (obj.element) {
			this.element.addChild(obj.element);
		}
		return this;
	};

	Container.prototype.select = function (id) {
		// console.info("select", id);
		var obj = this.all[id];
		return obj;
	};

	Container.prototype.delete = function (child) {
		var p = this;
		// console.info("select", id);
		p.element.removeChild(child.element);
		delete p.all[child.id]
		return p;
	};


	Container.prototype.update = function () {
		// console.info("update");
		this.parent.update();
		return this;
	};


	function Keyboard(p) {
		var keyboard = this;
		keyboard.p = p;
	}

	Keyboard.prototype.map = function (keyCombo, eventId) {
		var keyboard = this;
		var onDownCallback = function () {};
		var onUpCallback = function (e) {
			keyboard.p.socket.emit(eventId, {
				// "event": e
			});
		};
		KeyboardJS.on(keyCombo, onDownCallback, onUpCallback);
	}

	function Audio(p) {
		var audio = this;
		createjs.Sound.registerPlugins([createjs.WebAudioPlugin]);

		this.sounds = {}; // All defined audio files

	}


	Audio.prototype.register = function (id, url) {
		this.sounds[id] = new Sound(id, url);
		return this;
	}

	Audio.prototype.sound = function (id) {
		return this.sounds[id];
	}

	Audio.prototype.toggleMute = function () {
		this.setMute(!this.getMute());
		return this;
	}

	Audio.prototype.getMute = function () {
		return createjs.Sound.getMute();
	}

	Audio.prototype.setMute = function (val) {
		createjs.Sound.setMute(val);
		return this;
	}



	function Sound(id, url) {
		this.id = id;
		this.url = url;
		createjs.Sound.registerSound(url, id);
	}

	Sound.prototype.loop = function (defer) {
		var soundInstance = new SoundInstance(this);
		soundInstance.loop(defer);
		return soundInstance;
	}

	Sound.prototype.play = function (defer) {
		var soundInstance = new SoundInstance(this);
		soundInstance.play(defer);
		return soundInstance;
	}


	function SoundInstance(sound) {
		var soundInstance = this;

		this.sound = sound;
		this.volume = 1;
		this.isPlaying = false;
		this.isLooping = false;
		this.isMuted = false;
		if (createjs.Sound.loadComplete(sound.id)) {
			this.element = createjs.Sound.createInstance(sound.id);
		} else {
			createjs.Sound.addEventListener("loadComplete", onLoadComplete);
		}

		function onLoadComplete (e) {
			soundInstance.element = createjs.Sound.createInstance(sound.id);
			soundInstance.setVolume(soundInstance.volume);
			if (e.id === sound.id) {
				if (soundInstance.isLooping) {
					soundInstance.loop();
				} else if (soundInstance.isPlaying) {
					soundInstance.play();
				}
			}
		}
	}

	SoundInstance.prototype.mute = function (isMute) {
		this.isMuted = isMute;
		if (this.element) this.element.mute(isMute);
		return this;
	}

	SoundInstance.prototype.getMute = function () {
		if (this.element) return this.element.getMute();
		return this.isMuted;
	}

	SoundInstance.prototype.setVolume = function (level) {
		this.volume = level;
		if (this.element) this.element.setVolume(level);
		return this;
	}

	SoundInstance.prototype.loop = function (defer) {
		if (this.element) {
			this.element.play("none", 0, 0, -1);
		} else if (defer) {
			this.isLooping = true;
			this.isPlaying = true;
		}
		return this;
	}

	SoundInstance.prototype.play = function (defer) {
		if (this.element) {
			this.element.play();
		} else if (defer) {
			this.isLooping = true;
			this.isPlaying = true;
		}
		return this;
	}


	Pantograph.prototype.Audio = Audio;
	Pantograph.prototype.Bitmap = Bitmap;
	Pantograph.prototype.Container = Container;
	Pantograph.prototype.Animation = Animation;

	window.Pantograph = Pantograph;

})(jQuery, _);


