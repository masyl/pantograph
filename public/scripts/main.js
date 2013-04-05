;(function ($) {

	var socket;

	function ready() {

		var canvasElement = document.getElementById("scene");

		function resizeScene() {
		 	scene.width = document.width;
		    scene.height = document.height;
	    }

	    $(window).on("resize", resizeScene);
	    resizeScene();

		socket = io.connect('/');

		var p = new Pantograph(socket, canvasElement);

		console.log("Socket ready: ", socket);
	}




	$(ready);


})(jQuery, _);
