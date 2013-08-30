$(document).ready(function (){

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
	$("#showAddUrl").click(function(){
		$("#url").val('');
		$("#addUrl").show(0,function(){
			$("#doneUrl").hide();
		});
	});

	$("#submitUrl").click(submit);

	$("#url").keypress(function (e) {
  		if (e.which == 13) {
  			e.preventDefault();
  			submit();
  		}
	});
});