var myId;
var peer;
var videoStream = null;
var constraints = {audio:true,video:true};
var mediaConnection = null,dataConnection=null,myLocations=null;
var localCtracker,foreignCTracker, localCanvasInput, localcc,foreigncc,foreignCanvasInput;

$(document).ready(function(){
	peer = new Peer({key: 'lwjd5qra8257b9'});
	peer.on('open', function(id) {
		myId=id;
		console.log(myId);
	  $("#me").html(myId);
	});
	peer.on('call', function(call) {
	  // Answer the call, providing our mediaStream
	  navigator.mediaDevices.getUserMedia(constraints)
	  .then(function(stream) {
		console.log("stream ready");
		videoStream = stream;
		$('#localVideo').prop('src', URL.createObjectURL(videoStream));
	  	call.answer(videoStream);
	  	call.on('close', function(){
	  		disconnect();
	  		peer.disconnect();
	  	})
	  	call.on('stream', function(stream) {
	  	//mediaConnection.answer([stream]);
	  	// `stream` is the MediaStream of the remote peer.
	  	// Here you'd add it to an HTML video/canvas element.
		  	$('#foreignVideo').prop('src', URL.createObjectURL(stream));
		  	$('#foreignVideo').css('display','');
		  	if (mediaConnection == null)
				mediaConnection = peer.call(call.peer,videoStream);
			$('#call').prop('disabled',true);
			$('#disconnect').prop('disabled',false);
			$('#friend').html(call.peer);
		if (mediaConnection!=null && videoStream!=null)
			startTracking();
		});
	  });
	});
	peer.on('connection', function(conn) { 
		console.log('incoming connection');
		conn.on('data',function(data){
			//locator = (checkLocations(data) * 10)/71;
			drawScale(checkLocations(data));
		});
		conn.on('close', function(){
			disconnect();
		});
		dataConnection = conn;
	});
	peer.on('disconnected',function(){
		disconnect();
	});
	localCanvasInput = document.getElementById('localCanvas');
	localcc = localCanvasInput.getContext('2d');
	foreignCanvasInput = document.getElementById('foreignCanvas');
	foreigncc = foreignCanvasInput.getContext('2d');
	
});

function callFriend(){
	friendID = $("#friendid").val();
	try{
		navigator.mediaDevices.getUserMedia(constraints)
		.then(function(stream) {
		  console.log("stream ready");
		  videoStream = stream;
		  console.log('calling');
		   $('#localVideo').prop('src', URL.createObjectURL(videoStream));
		   	dataConnection = peer.connect(friendID);
		   	dataConnection.on('data', function(data){
		   		drawScale(checkLocations(data));
		   	});
			mediaConnection = peer.call(friendID,videoStream);
			$('#call').prop('disabled',true);
			$('#disconnect').prop('disabled',false);

		});
	}
	catch(err){
		console.log(err.message);
	}
}

function disconnect() {
	peer.disconnect();
	if (dataConnection!=null)
		dataConnection.close();
	$('#localVideo').prop('hidden', true);
	$('#foreignVideo').prop('hidden', true);
	videoStream.getTracks()[0].stop();
	mediaConnection = null;
	dataConnection = null;
	localCtracker.stop();
	//localcc.clearRect(0, 0, localCanvasInput.width, localCanvasInput.height);
	foreigncc.clearRect(0,0,340,240);
}

function startTracking(){
	vid = document.getElementById('localVideo');
	vid.play();
	localCtracker = new clm.tracker();
	localCtracker.init();
	localCtracker.start(vid);
	positionLoop();
}
function positionLoop() {
	requestAnimationFrame(positionLoop);
	//localcc.clearRect(0, 0, localCanvasInput.width, localCanvasInput.height);
	if (localCtracker.getCurrentPosition()) {
		//localCtracker.draw(localCanvasInput);
		myLocations=localCtracker.getCurrentPosition();
		if (dataConnection!=null){
			//console.log(myLocations);
			dataConnection.send(myLocations);
		}
	}
  }

  function checkLocations(locations){
  	var score = 0;
  	if (myLocations!=null && myLocations!=undefined){
	  	if (Math.abs(Math.abs((myLocations[62][0] - myLocations[1][0]) + (myLocations[1][1] - myLocations[62][1])) - Math.abs((locations[62][0] - locations[1][0]) + (locations[1][1] - locations[62][1]))) <=10)
	  		score++;
	  	if (Math.abs(Math.abs((myLocations[13][0] - myLocations[62][0]) + (myLocations[13][1] - myLocations[62][1])) - Math.abs((locations[13][0] - locations[62][0]) + (locations[13][1] - locations[62][1]))) <=10)
	  		score++;
	  	if (Math.abs(Math.abs((myLocations[62][0] - myLocations[20][0]) + (myLocations[20][1] - myLocations[62][1])) - Math.abs((locations[62][0] - locations[20][0]) + (locations[20][1] - locations[62][1]))) <=10)
	  		score++;
	  	if (Math.abs(Math.abs((myLocations[16][0] - myLocations[62][0]) + (myLocations[16][1] - myLocations[62][1])) - Math.abs((locations[16][0] - locations[62][0]) + (locations[16][1] - locations[62][1]))) <=10)
	  		score++;
	  	if (Math.abs(Math.abs((myLocations[62][0] - myLocations[7][0]) + (myLocations[62][1] - myLocations[7][1])) - Math.abs((locations[62][0] - locations[7][0]) + (locations[62][1] - locations[7][1]))) <=10)
	  		score++;
	  	
	}
  	return score;
  }

  function drawScale(locator){ 
  	console.log(locator);
  	if (isNaN(locator)){
  		console.log('nan');
  		return;
  	}
    var img=document.createElement('img');
    img.src = 'empty.png';
    img.width = 220;
    img.height = 277;
    //ctx.drawImage(img,cx,cy,cw,ch);
    var cw=340+(locator*150),
		cx=(locator)*(-75),
		ch=240+(locator*150),
		cy=(locator)*(-75);
	foreigncc.clearRect(cx,cy,cw,ch);
	foreigncc.drawImage(img,cx,cy,cw,ch);
  }

  