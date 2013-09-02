$(document).ready(function (){

	function gotoRoot(){
		window.location = "../";
	}

	$("#errRedirect").click(gotoRoot);

	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
	  		e.preventDefault();
	  		gotoRoot();
		}
	});	

});
