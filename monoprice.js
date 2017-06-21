
function getURL(codeurl) { // Will check if am in iframe later.
	return $.ajax({
			url: codeurl,
			cache: false
		});
}



$tooQuick = false;
$extruderTemp = '0';
$bedTemp = '0';
function pad(num, size) {
	var s = "000" + num;
	return s.substr(s.length - size);
}
$(document).ready(function() {
	var gCodeLog = document.getElementById("gCodeLog");
	$("#newDropzone").addClass('disabledbutton');
	$(".controlBox").addClass('disabledbutton');
	$("#rawgCode").addClass('disabledbutton');
	setInterval(function() {
		$.get("inquiry", function(data, status) {
			console.log(data);
			$('#gCodeLog').append('<br>'+data);
			$("#rde").text(data.match(/\d+/g)[0]);
			//$("#rdeTarget").text(data.match(/\d+/g)[1]);
			var exTgt = data.match(/\d+/g)[1];
			if (exTgt>30 || exTgt==0) $("#rdeTarget").text(exTgt);
			$("#rdp").text(data.match(/\d+/g)[2]);
			$("#rdpTarget").text(data.match(/\d+/g)[3]);
			$extruderTemp = data.match(/\d+/g)[0];
			$extruderTarget = data.match(/\d+/g)[1];
			$bedTemp = data.match(/\d+/g)[2];
			$bedTarget = data.match(/\d+/g)[3];
			var c = data.charAt(data.length - 1);
			if (c == 'I') {
				$("#stat").text("Idle");
				$("#pgs").css("width", "0%");
				$("#newDropzone").removeClass('disabledbutton');
				$(".controlBox").removeClass('disabledbutton');
				$("#rawgCode").removeClass('disabledbutton');
			} else if (c == 'P') {
				$("#newDropzone").addClass('disabledbutton');
				$(".controlBox").addClass('disabledbutton');
				$("#rawgCode").addClass('disabledbutton');
				$("#stat").text("Printing");
				$("#pgs").css("width", data.match(/\d+/g)[4] + "%");
				$("#pgs").html(data.match(/\d+/g)[4] + "%");
			} else $("#stat").text(" ");
		});
	}, 5000);
	$("#sete").click(function() {
		var value = pad($("#wre").val(), 3);
		getURL('set?cmd={C:T0' + value + '}').done(function(html) {});
	});
	$("#clre").click(function() {
		getURL("set?cmd={C:T0000}").done(function(html) {});
	});
	$("#setp").click(function() {
		var value = pad($("#wrp").val(), 3);
		getURL('set?cmd={C:P' + value + '}').done(function(html) {});
	});
	$("#clrp").click(function() {
		getURL("set?cmd={C:P000}").done(function(html) {});
	});
});
String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};
Dropzone.options.mydz = {
	dictDefaultMessage: "Upload GCode here",
	accept: function(file, done) {
		if (file.name.contains(".g")) done();
		else done("Not a valid GCode file.");
	},
	init: function() {
		this.on('error', function(file, response) {
			var errorMessage = response.errorMessage;
			$(file.previewElement).find('.dz-error-message').text(errorMessage);
		});
		this.on("addedfile", function() {
			if (this.files[1] != null) {
				this.removeFile(this.files[0]);
			}
		});
	}
};
function start_p() {
	getURL("set?code=M565").done(function(html) {});
}
function cancel_p() {
	getURL("set?cmd={P:X}").done(function(html) {});
}
$('#sendRAWgCode').click(function() {
	var gCode2Send = $('#gcode').val();
	if (gCode2Send == '') {
		alert("You didn't enter anything!");
		return;
	}
	getURL("set?code=" + gCode2Send).done(function(html) {
	   $('#gcode').val('');
	   $('#gCodeLog').append("<br>"+gCode2Send);
		gCodeLog.scrollTop = gCodeLog.scrollHeight;
	});
});
$('#eStop').click(function() {
	getURL("set?code=M112\nM999").done(function(html) {
	   $('#gCodeLog').append("<br>M112; Emergency Stop!");
		gCodeLog.scrollTop = gCodeLog.scrollHeight;
	   alert('You will have to restart the printer to use this menu.');
	});
});
function setFan($fSpeed){
	getURL("set?code=M106 S" + $fSpeed).done(function(html) {
	   $('#gCodeLog').append("<br>M106 S" + $fSpeed);
		gCodeLog.scrollTop = gCodeLog.scrollHeight;
	});
}
$('.homeIt').click(function() {
	var doWhat = $(this).data('id');
	var whatAxis = $(this).data('axis');
	getURL("set?code=G28 " + doWhat).done(function(html) {
		$('#gCodeLog').append("<br>G28 " +doWhat);
		gCodeLog.scrollTop = gCodeLog.scrollHeight;
		if (whatAxis == 'XYZ') {
			$('#posX, #posY, #posZ').val('0');
			$('#posX, #posY, #posZ').removeClass('unkPos');
			$axisX = '0';
			$axisY = '0';
			$axisZ = '0';
		} else if (whatAxis == 'XY') {
			$('#posX, #posY').val('0');
			$('#posX, #posY').removeClass('unkPos');
			$axisX = '0';
			$axisY = '0';
		} else {
			$('#pos' + whatAxis).val('0');
			$('#pos' + whatAxis).removeClass('unkPos');
			switch(whatAxis) {
				case 'X':
				  $axisX = '0';
				  break;
				case 'Y':
				  $axisY = '0';
				  break;
				case 'Z':
				  $axisZ = '0';
				  break;
			}
		}
	});
});
$axisX = '0';
$axisY = '0';
$axisZ = '0';
function atMax(){
  $('#movement').html('<span style="color: #ff0000;">ILLEGAL MOVEMENT</span>');
  setTimeout(function(){
	$('#movement').html('Movement');
  }, 500);
}
$('.moveIt').click(function() {
	if($tooQuick == true){
	  $('#movement').html('<span style="color: #ff0000;">Too fast!</span>');
	  setTimeout(function(){
		$('#movement').html('Movement');
	  }, 100);
	  return;
	}
	var doSpeed = $(this).data('speed');
	var doWhat = $(this).data('id');
	var doWhere = $(this).data('axis');
	var axisVal = $('#pos' + doWhere).val()
	axisVal = +doWhat + +axisVal;
	switch(doWhere) {
	  case 'X':
		  $axisX = +$axisX + +doWhat;
		  if($axisX >= '120' || $axisX < '0'){
			atMax();
			$axisX = +$axisX - +doWhat;
			return;
		  }
		  break;
	  case 'Y':
		  $axisY = +$axisY + +doWhat;
		  if($axisY >= '120' || $axisY < '0'){
			atMax();
			$axisY = +$axisY - +doWhat;
			return;
		  }
		  break;
	  case 'Z':
		  $axisZ = +$axisZ + +doWhat;
		  if($axisZ >= '120' || $axisZ < '0'){
			atMax();
			$axisZ = +$axisZ - +doWhat;
			return;
		  }
		  break;
	  default:
	}
	$tooQuick = true;
	getURL("set?code=G91").done(function(html) {});
	getURL("set?code=G1 " + doSpeed + ' ' + doWhere + doWhat).done(function(html) {
		$('#pos' + doWhere).val(axisVal);
		$tooQuick = false;
		$('#gCodeLog').append("<br>G90, G1 " + doSpeed + ' ' + doWhere + doWhat);
		gCodeLog.scrollTop = gCodeLog.scrollHeight;
	});
});
  $(document).ready(function() {
	$("#dropzone").appendTo("#newDropzone").show();
	$("#tempChart").appendTo("#newTempChart").show();
  });

$(document).ready(function() {
$(function() {
  var data = [];
  var data2 = [];
  var totalPoints = 300;

  function getData() {
	data = data.slice(1);
	while (data.length < totalPoints) {
	  var x = new Date($.now());
	  var y = $extruderTemp; 
	  data.push(y);
	}
	var res = [];
	for (var i = 0; i < data.length; ++i) {
	  res.push([i, data[i]]);
	}
	return res;
  }

  function getData2() {
	data2 = data2.slice(1);
	while (data2.length < totalPoints) {
	  var x = new Date($.now());
	  var y = $bedTemp; 
	  data2.push(y);
	}
	var res2 = [];
	for (var i = 0; i < data2.length; ++i) {
	  res2.push([i, data2[i]]);
	}
	return res2;
  }

  // Set up the control widget
  var updateInterval = 500;
  var plot = $.plot("#tempChart", [ getData() ], {
	series: {
	  shadowSize: 0	 // Drawing is faster without shadows
	},
	colors:['#ff0000'],
	yaxis: {
	  min: 0,
	  max: 300,
	  zoomRange: [0.5, 310],
	  panRange: [0, 300]
	},
	xaxis: {
	  show: false,
	  zoomRange: [0.5, 310],
	  panRange: [0, 300]
	},
	zoom: {
	  interactive: true
	},
	pan: {
	  interactive: true
	}
  });

  var plot2 = $.plot("#tempChart2", [ getData2() ], {
	series: {
	  shadowSize: 0	 // Drawing is faster without shadows
	},
	colors:['#0037ff'],
	yaxis: {
	  min: 0,
	  max: 120,
	  zoomRange: [0.5, 310],
	  panRange: [0, 300]
	},
	xaxis: {
	  show: false,
	  zoomRange: [0.5, 310],
	  panRange: [0, 300]
	},
	zoom: {
	  interactive: true
	},
	pan: {
	  interactive: true
	}

  });

  var tempChart = $("#tempChart");
  var tempChart2 = $("#tempChart2");

  // add zoom out button 
  $("<div class=\"btn btn-default\" style=\"display: block; width: 40px; float: right; position: relative; top: 10px; right: 10px;\"><i class=\"fa fa-search-minus\"></i></div>").appendTo(tempChart).click(function (event) 
{
	event.preventDefault();
	plot.zoomOut();
  });
  $("<div class=\"btn btn-default\" style=\"display: block; width: 40px; float: right; position: relative; top: 10px; right: 10px;\"><i class=\"fa fa-search-minus\"></i></div>").appendTo(tempChart2).click(function 
(event) {
	event.preventDefault();
	plot2.zoomOut();
  });

  function update() {
	plot.setData([getData()]);
	plot2.setData([getData2()]);
	// Since the axes don't change, we don't need to call plot.setupGrid()
	plot.draw();
	plot2.draw();
	setTimeout(update, updateInterval);
  }

  update();
  });

});

$(function(){
  $("#fanSlider").slider({
	value:0,
	min:0,
	max:255,
	step:25.5,
	slide: function( event, ui ){
	  var fanPercent = ui.value;
	  setFan(ui.value);
	  var fanMax = 255;
	  fanPercent = (fanPercent/fanMax)*100;
	  if (fanPercent == '0'){
		fanPercent = "Off";
	  }else{
		fanPercent = fanPercent+"%";
	  }
	  $("#fanAmount").html(fanPercent);
	}
  });
});
