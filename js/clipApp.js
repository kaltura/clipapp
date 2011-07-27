window.clipApp = {};

// Log function
clipApp.log = function(msg) {
	if(this.vars.debug) {
		if( typeof console !='undefined' && console.log){
			console.log('ClipApp :: ' + msg);
		}
	}
};

// Set default vars
clipApp.vars = {
	host: "www.kaltura.com",
	redirect_save: false,
	redirect_url: "http://www.kaltura.com/",
	debug: true
};

clipApp.init = function( options ) {
	$.extend( this.vars, options );
};

var jsCallbackReady = function( videoId ) {
	clipApp.kdp = $("#" + videoId ).get(0);

	clipApp.kdp.addJsListener("mediaReady", "clipApp.player.doFirstPlay");
	clipApp.kdp.addJsListener("playerPlayed", "clipApp.player.playerPlaying");
	clipApp.kdp.addJsListener("playerPaused", "clipApp.player.playerPaused");
};

var clipperReady = function() {
	clipApp.kClip = $("#clipper").get(0);

	clipApp.kClip.addJsListener("clipStartChanged", "clipApp.updateStartTime");
	clipApp.kClip.addJsListener("clipEndChanged", "clipApp.updateEndTime");
	clipApp.kClip.addJsListener("entryReady", "clipApp.enableAddClip");
	clipApp.kClip.addJsListener("clipAdded", "clipApp.addClipForm");
	clipApp.kClip.addJsListener("clipperError", "clipApp.showError");
};

/* Init the App */
$(function() {
	clipApp.log('Init App');

	clipApp.createTimeSteppers();
	clipApp.activateButtons();

});

// Contains all player related functions
clipApp.player = {

	doFirstPlay: function() {
		clipApp.log('doFirstPlay');
		clipApp.player.firstLoad = true;
		clipApp.kdp.sendNotification("doPlay");
	},

	playerPlaying: function() {
		clipApp.log('clipApp.player.playerPlaying');
		if( clipApp.player.firstLoad ) {
			clipApp.log('pauseKdp');
			clipApp.player.firstLoad = false;
			setTimeout( function() {
				clipApp.kdp.sendNotification("doPause");
			}, 50);
		}

		clipApp.kClip.removeJsListener("playheadUpdated", "clipApp.player.updatePlayhead");
		clipApp.kdp.addJsListener("playerUpdatePlayhead", "clipApp.clipper.updatePlayhead");
	},

	playerPaused: function() {
		clipApp.kClip.addJsListener("playheadUpdated", "clipApp.player.updatePlayhead");
		clipApp.kdp.removeJsListener("playerUpdatePlayhead", "clipApp.clipper.updatePlayhead");
	},

	updatePlayhead: function(val) {
		val = Math.floor( val / 1000 );
		clipApp.kdp.sendNotification("doSeek", val);
		setTimeout(function() {
			clipApp.kdp.sendNotification("doPause");
		}, 250);
	}
};

// Contains all clipper related functions
clipApp.clipper = {
	addClip: function() {
		var video_length = clipApp.getLength();
		var clip_length = ( (video_length * 10) / 100 ) * 1000;
		var clip_offset = clipApp.kClip.getPlayheadLocation();
		clipApp.kClip.addClipAt(clip_offset, clip_length);
		clipApp.log('addClipAt (Length: ' + clip_length + ')');
		clipApp.updateStartTime(clip_offset);
		clipApp.updateEndTime(clip_offset + clip_length);
		setTimeout( function() {
			clipApp.kdp.sendNotification("doPause");
		}, 250);
	},

	updatePlayhead: function(val) {
		clipApp.kClip.scrollToPoint(val * 1000);
	}
};

clipApp.updateStartTime = function(clip) {
	var val = (typeof clip === "object") ? clip.clipAttributes.offset : clip;
	val = Math.floor( val );
	clipApp.log('updateStartTime (' + val + ')');
	$("#startTime").timeStepper( 'setValue', val );
};

clipApp.updateEndTime = function(clip) {
	var val = (typeof clip === "object") ? (clip.clipAttributes.offset + clip.clipAttributes.duration) : clip;
	if( val > 0 ) {
		clipApp.log('updateEndTime (' + val + ')');
		$("#endTime").timeStepper( 'setValue', val );
	}
};

clipApp.getLength = function() {
	return clipApp.vars.entry.duration;
};

clipApp.showError = function(error) {
	alert(error.messageText);
};

clipApp.getEmbedCode = function(entry_id) {

	var unique_id = clipApp.getUniqueId();
	var entry_url = 'http://' + clipApp.vars.host + '/kwidget/wid/_' + clipApp.vars.partner_id + '/uiconf_id/' + clipApp.vars.kdp.id + '/entry_id/' + entry_id;
	
	var embed_code = '<object id="kaltura_player_' + unique_id + '" name="kaltura_player_' + unique_id + '" type="application/x-shockwave-flash" allowFullScreen="true"' +
				' allowNetworking="all" allowScriptAccess="always" height="' + clipApp.vars.kdp.height + '" width="' + clipApp.vars.kdp.width + '" bgcolor="#000000"' +
				' resource="' + entry_url + '" data="' + entry_url + '"><param name="allowFullScreen" value="true" /><param name="allowNetworking" value="all" />' +
				' <param name="allowScriptAccess" value="always" /><param name="bgcolor" value="#000000" /><param name="movie" value="' + entry_url + '" /></object>';

	return embed_code;
};

clipApp.getUniqueId = function() {
	var d = new Date();
	return d.getTime().toString().substring(4);
};

clipApp.addClipForm = function() {
	$("#newclip").hide();
	$("#embed").hide();
	$("#timers").fadeIn();
	$("#form").fadeIn();
	$("#actions").fadeIn();
};

clipApp.createTimeSteppers = function() {
	clipApp.log('Create Time Steppers');
	$("#startTime").timeStepper( {
		onChange: function( val ) {
			//console.log('start time changed:' + val);
			//clipApp.kClip.updateInTime( val );
		}
	} );
	$("#endTime").timeStepper( {
		onChange: function( val ) {
			//console.log('end time changed:' + val);
			//var length = ( val - $("#startTime").timeStepper( 'getValue' ) );
			//clipApp.kClip.updateClipLength( length );
		}
	} );
};

clipApp.setStartTime = function( val ) {

	var currentClip = clipApp.kClip.getSelected();

	var duration = currentClip.clipAttributes.duration - (val - currentClip.clipAttributes.offset);

	if( val >= $("#endTime").timeStepper( 'getValue' ) ) {
		alert('Start time cannot be bigger then End time. ')
		return false;
	}

	clipApp.kClip.updateInTime( val );
	clipApp.updateStartTime( val );

	clipApp.kClip.updateClipLength( duration );
	clipApp.updateEndTime( val + duration );

	clipApp.kdp.sendNotification("doPause");

	return true;
};

clipApp.setEndTime = function( val ) {
	if( val <= $("#startTime").timeStepper( 'getValue' ) ) {
		alert('End time cannot be smaller then Start time');
		return false;
	}
	var length = ( val - $("#startTime").timeStepper( 'getValue' ) );
	clipApp.kClip.updateClipLength(length);
	clipApp.updateEndTime( val );
	clipApp.kdp.sendNotification("doPause");
	return true;
};

clipApp.activateButtons = function() {
	clipApp.log('Activate Buttons');

	$("#newclip input").click( function() {
		clipApp.clipper.addClip();
	});

	$("#preview").click( function() { clipApp.doPreview(); });

	$("#setStartTime").click( function() {
		var currentTime = clipApp.kdp.evaluate('{video.player.currentTime}') * 1000;
		clipApp.setStartTime( currentTime );
	});

	$("#setEndTime").click( function() {
		var currentTime = clipApp.kdp.evaluate('{video.player.currentTime}') * 1000;
		clipApp.setEndTime( currentTime );
	});

	$("#setST").click( function() {
		clipApp.setStartTime( $("#startTime").timeStepper( 'getValue' ) );
	});

	$("#setET").click( function() {
		clipApp.setEndTime( $("#endTime").timeStepper( 'getValue' ) );
	});

	$("#delete").click( function() {
		if ( confirm("Are you sure you want to delete?") ) {
			clipApp.deleteClip();
		}
		return false;
	});

	$("#save").click( function() {
		clipApp.doSave();
	});
};

clipApp.enableAddClip = function() {
	$("#newclip input").attr('disabled', false);
};

clipApp.doPreview = function() {
	var startTime = $("#startTime").timeStepper( 'getValue', 'seconds' ),
		endTime = $("#endTime").timeStepper( 'getValue', 'seconds' );

	clipApp.log('Start Time: ' + startTime + ', End Time: ' + endTime );

	clipApp.kdp.sendNotification("doStop");
	clipApp.kdp.setKDPAttribute("mediaProxy", "mediaPlayFrom", startTime );
	clipApp.kdp.setKDPAttribute("mediaProxy", "mediaPlayTo", endTime );
	clipApp.kdp.sendNotification("doPlay");
};

clipApp.showEmbed = function( entry_id ) {
	// Hide current elements
	clipApp.deleteClip();

	// Set embed code
	$("#embedcode").click( function() { this.select(); } );
	$("#embedcode").val( clipApp.getEmbedCode( entry_id ) );

	// Show embed code
	$("#embed").fadeIn();
};

clipApp.doSave = function() {
	// Show Loading
	$("#loading").fadeIn();

	// Get Params
	var params = {
		'entryId': clipApp.vars.entry.id,
		'name': $("#entry_title").val(),
		'desc': $("#entry_desc").val(),
		'start': $("#startTime").timeStepper( 'getValue' ),
		'end': $("#endTime").timeStepper( 'getValue' )
	};

	// Make the request
	$.ajax({
		url: "save.php",
		type: "post",
		data: params,
		dataType: "json",
		success: function(res) {
			$("#loading").fadeOut();
			if( clipApp.vars.redirect_save === true ) {
				window.location.href = clipApp.vars.redirect_url;
			} else {
				clipApp.showEmbed(res.id);
			}
		}
	});

};

clipApp.deleteClip = function() {
	// Stop the KDP
	clipApp.kdp.sendNotification("doStop");

	// Remove clip from clipper
	clipApp.kClip.deleteSelected();

	// Reset fields
	$("#startTime").timeStepper( 'setValue', 0);
	$("#endTime").timeStepper( 'setValue', 0);
	$("#entry_title").val('');
	$("#entry_desc").val('');

	$("#newclip").fadeIn();
	$("#timers").hide();
	$("#form").hide();
	$("#actions").hide();
};

clipApp.isIpad = function(){
	return ( navigator.userAgent.indexOf('iPad') != -1 );
};