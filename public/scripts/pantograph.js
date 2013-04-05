;(function ($) {

	var mouseThrottle = 30;

	var Ticker = createjs.Ticker;
	var Stage = createjs.Stage;
	var Bitmap = createjs.Bitmap;

	Ticker.setFPS(60);
	Ticker.addListener(window);


	function Pantograph(socket, canvasElement) {
		var p = this;

		p.socket = socket;
		p.canvas = canvasElement;
		p.element = p.stage = new Stage(canvasElement);

		p.socket.on("exec", function (data) {
			//console.log(data.macro, data.model);
			p.exec(data.macro, data.model);
			p.stage.update();
		});

		// index of all object by their ID's
		p.all = {};

	};

	Pantograph.prototype.exec = function (macro, model) {
		// console.info("exec", macro, model);
		var fn = funex(macro);
		var scope = [{p: this}, model];
		var result = fn(scope);
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

			// console.info("mouse tracking started")
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


			// console.info("mouse tracking started")
			p.stage.onMouseUp = function onMouseUp(mouseEvent) {
				if (p.stage) {
					p.socket.emit("mouseUp", {
						x: mouseEvent.stageX,
						y: mouseEvent.stageY
					});
				}
			};

			p.stage.onMouseDown = function onMouseDown(mouseEvent) {
				if (p.stage) {
					p.socket.emit("mouseDown", {
						x: mouseEvent.stageX,
						y: mouseEvent.stageY
					});
				}
			};



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


	function _Bitmap(id) {
		if ( !(this instanceof _Bitmap) )
			return new _Bitmap(id);

		this.id = id;
		this.x = 0;
		this.y = 0;
		this.image = null;
		this.element = null;
		this.parent = null;
	}

	_Bitmap.prototype.src = function (uri) {
		var bitmap = this;
		bitmap.image = new Image();
		bitmap.image.src = uri;
		bitmap.image.onload = function(e){
			bitmap.element = new Bitmap(e.target);
			bitmap.update();
			if (bitmap.parent) {
				bitmap.parent.add(bitmap);
				bitmap.parent.update();
			}
			// console.info("Bitmap created:", bitmap.element);
		}
		return this;
	}

	_Bitmap.prototype.delete = function () {
		this.parent.delete(this);
		return this;
	}

	_Bitmap.prototype.addTo = function (parent) {
		parent.add(this);
		return this;
	}

	_Bitmap.prototype.move = function (x, y) {
		this.x = x;
		this.y = y;
		this.update();
		return this;
	}

	_Bitmap.prototype.reg = function (x, y) {
		this.regX = x;
		this.regY = y;
		this.update();
		return this;
	}

	_Bitmap.prototype.update = function () {
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



	Pantograph.prototype.Bitmap = _Bitmap;
	Pantograph.prototype.Container = Container;

	window.Pantograph = Pantograph;

})(jQuery, _);
