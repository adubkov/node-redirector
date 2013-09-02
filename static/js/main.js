$(document).ready(function (){

	if ($('#errClose')[0]) {
		$("#addUrl").hide();
	}
	/** 
	*
	*/
	function submit() {
		$.post(window.location.href, {url:$("#url").val()}, function(data) {
			$("#resultUrl").html('<a href="' + window.location.origin + data.url + '" target="_blank">' + window.location.origin + data.url + '</a>');
		}, 'json')
		.fail(function() { alert('Shit happened!') })
		.always(function() {
			$("#doneUrl").show(0,function(){
				$("#addUrl").hide();
			});
		});
	}

	function showAddUrl() {
		$("#url").val('');
		$("#addUrl").show(0,function(){
			$("#doneUrl").hide();
			$("#err").hide();
		});
	}

	$("#showAddUrl").click(showAddUrl);

	$("#submitUrl").click(submit);

	$("#url").keypress(function (e) {
  		if (e.which == 13) {
  			e.preventDefault();
  			submit();
  		}
	});

	$("#errClose").click(showAddUrl);
	
	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
	  		e.preventDefault();
	  		showAddUrl();
		}
	});

});
