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
	overwrite_entry: false,
	updateClipperPlayhead: true,
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
	clipApp.kdp.addJsListener("doSeek", "clipApp.resetPreview");
};

var clipperReady = function() {
	clipApp.kClip = $("#clipper").get(0);

	clipApp.kClip.addJsListener("clipStartChanged", "clipApp.updateStartTime");
	clipApp.kClip.addJsListener("clipEndChanged", "clipApp.updateEndTime");
	clipApp.kClip.addJsListener("entryReady", "clipApp.enableAddClip");
	clipApp.kClip.addJsListener("clipAdded", "clipApp.addClipForm");
	clipApp.kClip.addJsListener("clipperError", "clipApp.showError");
	clipApp.kClip.addJsListener("playheadDragStart", "clipApp.clipper.dragStarted");
	clipApp.kClip.addJsListener("playheadDragDrop", "clipApp.player.updatePlayhead")
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
		clipApp.vars.removeBlackScreen = true;

		clipApp.kClip.removeJsListener("playheadUpdated", "clipApp.player.updatePlayhead");
		clipApp.kdp.addJsListener("playerUpdatePlayhead", "clipApp.clipper.updatePlayhead");
	},

	playerPaused: function() {
		clipApp.kClip.addJsListener("playheadUpdated", "clipApp.player.updatePlayhead");
		clipApp.kdp.removeJsListener("playerUpdatePlayhead", "clipApp.clipper.updatePlayhead");
	},

	updatePlayhead: function(val) {
		clipApp.clipper.dragging = false;
		if( clipApp.clipper.dragging === false ) {
			clipApp.kClip.addJsListener("playheadUpdated", "clipApp.player.updatePlayhead");
		}

		val = Math.floor( val / 1000 );
		clipApp.vars.updateClipperPlayhead = false;
		clipApp.kdp.sendNotification("doSeek", val);
		setTimeout(function() {
			clipApp.kdp.sendNotification("doPause");
		}, 250);
	}
};

// Contains all clipper related functions
clipApp.clipper = {
	dragging: false,
	addClip: function( start, end ) {
		var clip_length = (end) ? end : ( ( (clipApp.getLength() * 10) / 100 ) * 1000 );
		var clip_offset = (start) ? start : clipApp.kClip.getPlayheadLocation();
		clipApp.kClip.addClipAt(clip_offset, clip_length);
		clipApp.log('addClipAt (Length: ' + clip_length + ')');
		clipApp.updateStartTime(clip_offset);
		clipApp.updateEndTime(clip_offset + clip_length);
		setTimeout( function() {
			clipApp.kdp.sendNotification("doPause");
		}, 250);
	},

	updatePlayhead: function(val) {
		if( clipApp.vars.updateClipperPlayhead === true ) {
			clipApp.kClip.scrollToPoint(val * 1000);
		} else {
			clipApp.vars.updateClipperPlayhead = true;
		}
	},
	dragStarted: function() {
		clipApp.clipper.dragging = true;
		clipApp.kClip.removeJsListener("playheadUpdated", "clipApp.player.updatePlayhead");
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
	var entry_url = 'http://' + clipApp.vars.host + '/kwidget/wid/_' + clipApp.vars.partner_id + '/uiconf_id/' + clipApp.vars.kdp_uiconf_id + '/entry_id/' + entry_id;
	
	var embed_code = '<object id="kaltura_player_' + unique_id + '" name="kaltura_player_' + unique_id + '" type="application/x-shockwave-flash" allowFullScreen="true"' +
				' allowNetworking="all" allowScriptAccess="always" height="330" width="400" bgcolor="#000000"' +
				' resource="' + entry_url + '" data="' + entry_url + '"><param name="allowFullScreen" value="true" /><param name="allowNetworking" value="all" />' +
				' <param name="allowScriptAccess" value="always" /><param name="bgcolor" value="#000000" /><param name="movie" value="' + entry_url + '" /></object>';

	return embed_code;
};

clipApp.getUniqueId = function() {
	var d = new Date();
	return d.getTime().toString().substring(4);
};

clipApp.addClipForm = function() {
	if( $("#newclip").find('.disable').length == 0 ) {
		$("#newclip").prepend( clipApp.disableDiv() );
	}
	$("#fields").show().find('.disable').remove();
	$("#actions").find('.disable').remove();
	
	if( clipApp.vars.overwrite_entry ) {
		$("#delete").remove();
		$(".seperator").remove();
	}

	$("#save").find('.disable').remove();
	$("#embed").hide();
};

clipApp.disableDiv = function() {
	return $('<div />').addClass('disable');
};

clipApp.createTimeSteppers = function() {
	clipApp.log('Create Time Steppers');
	$("#startTime").timeStepper( {
		onChange: function( val ) {
			clipApp.kClip.removeJsListener("clipStartChanged", "clipApp.updateStartTime");
			clipApp.kClip.removeJsListener("clipEndChanged", "clipApp.updateEndTime");
			clipApp.setStartTime( val );
			clipApp.kClip.addJsListener("clipStartChanged", "clipApp.updateStartTime");
			clipApp.kClip.addJsListener("clipEndChanged", "clipApp.updateEndTime");
		}
	} );
	$("#endTime").timeStepper( {
		onChange: function( val ) {
			clipApp.kClip.removeJsListener("clipStartChanged", "clipApp.updateStartTime");
			clipApp.kClip.removeJsListener("clipEndChanged", "clipApp.updateEndTime");
			clipApp.setEndTime( val );
			clipApp.kClip.addJsListener("clipStartChanged", "clipApp.updateStartTime");
			clipApp.kClip.addJsListener("clipEndChanged", "clipApp.updateEndTime");
		}
	} );
};

clipApp.updateStartTime = function(clip) {
	var val = (typeof clip === "object") ? clip.clipAttributes.offset : clip;
	val = Math.floor( val );
	clipApp.log('updateStartTime (' + val + ')');
	$("#startTime").timeStepper( 'setValue', val );
	clipApp.vars.lastStartTime = val;
};

clipApp.updateEndTime = function(clip) {
	var val = (typeof clip === "object") ? (clip.clipAttributes.offset + clip.clipAttributes.duration) : clip;
	if( val > 0 ) {
		clipApp.log('updateEndTime (' + val + ')');
		$("#endTime").timeStepper( 'setValue', val );
		clipApp.vars.lastEndTime = val;
	}
};

clipApp.checkClipDuration = function( val, type ) {

	var minLength = 0;
	if( type == 'start' ) {
		minLength = $("#endTime").timeStepper( 'getValue' ) - val;
	} else if( type == 'end' )	 {
		minLength = val - $("#startTime").timeStepper( 'getValue' );
	}
	
	if( minLength <= 100 ) {
		alert('Clip duration must be at least 100ms');
		return false;
	}

	if( val > (clipApp.getLength()) * 1000 ) {
		alert('End time cannot be bigger than entry duration.');
		return false;
	}

	return true;
};

clipApp.setStartTime = function( val ) {
	if( !clipApp.checkClipDuration( val, 'start') ) {
		$("#startTime").timeStepper( 'setValue', clipApp.vars.lastStartTime );
		return false;
	}
	
	var currentClip = clipApp.kClip.getSelected();
	var duration = currentClip.clipAttributes.duration - (val - currentClip.clipAttributes.offset);

	clipApp.kClip.updateClipAttributes( { offset: val, duration: duration} );
	clipApp.updateEndTime( val + duration );
	clipApp.updateStartTime( val );
	clipApp.kdp.sendNotification("doPause");

	return true;
};

clipApp.setEndTime = function( val ) {
	if( !clipApp.checkClipDuration( val, 'end') ) {
		$("#endTime").timeStepper( 'setValue', clipApp.vars.lastEndTime );
		return false;
	}

	var currentClip = clipApp.kClip.getSelected();
	var length = ( val - $("#startTime").timeStepper( 'getValue' ) );
	clipApp.kClip.updateClipAttributes( { offset: currentClip.clipAttributes.offset, duration: length} );
	clipApp.updateEndTime( val );
	clipApp.kdp.sendNotification("doPause");
	return true;
};

clipApp.activateButtons = function() {
	clipApp.log('Activate Buttons');

	$("#newclip a").click( function() {
		clipApp.clipper.addClip();
	});

	$("#preview").click( function() { clipApp.doPreview(); });

	$("#setStartTime").click( function() {
		clipApp.setStartTime( clipApp.kClip.getPlayheadLocation() );
	});

	$("#setEndTime").click( function() {
		clipApp.setEndTime( clipApp.kClip.getPlayheadLocation() );
	});

	$("#delete").click( function() {
		if ( confirm("Are you sure you want to delete?") ) {
			clipApp.deleteClip();
		}
		return false;
	});

	$("#save a").click( function() {
		clipApp.doSave();
		return false;
	});
};

clipApp.enableAddClip = function() {
	if( clipApp.vars.overwrite_entry ) {
		clipApp.log('Add new clip for trimming', (clipApp.getLength() * 1000) );
		clipApp.clipper.addClip(0, (clipApp.getLength() * 1000) );
	}
	$("#newclip").find('.disable').remove();
};

clipApp.doPreview = function() {
	var startTime = $("#startTime").timeStepper( 'getValue', 'seconds' ),
		endTime = $("#endTime").timeStepper( 'getValue', 'seconds' );

	clipApp.log('Start Time: ' + startTime + ', End Time: ' + endTime );

	clipApp.kdp.sendNotification("doStop");
	clipApp.kdp.setKDPAttribute("blackScreen", "visible", "true" );
	clipApp.kdp.setKDPAttribute("mediaProxy", "mediaPlayFrom", startTime );
	clipApp.kdp.setKDPAttribute("mediaProxy", "mediaPlayTo", endTime );
	clipApp.kdp.sendNotification("doPlay");

	clipApp.vars.removeBlackScreen = false;
};

clipApp.resetPreview = function(val) {
	if( clipApp.vars.removeBlackScreen ) {
		clipApp.log('resetPreview');
		clipApp.kdp.setKDPAttribute("blackScreen", "visible", "false" );
	}

	clipApp.clipper.updatePlayhead(val);
};

clipApp.showEmbed = function( entry_id ) {
	// Hide current elements
	clipApp.deleteClip();

	// Set embed code
	$("#embedcode").click( function() { this.select(); } );
	$("#embedcode").val( clipApp.getEmbedCode( entry_id ) );

	// Show embed code
	$("#fields").hide();
	$("#newclip").find('.disable').remove();
	$("#embed").show();
};

clipApp.doSave = function() {
	if( ($("#endTime").timeStepper( 'getValue' ) - $("#startTime").timeStepper( 'getValue' )) <= 100 ) {
		alert('Clip duration must be bigger then 100ms.');
		return false;
	}

	$("#loader").fadeIn();

	$("#newclip").prepend( clipApp.disableDiv() );
	$("#fields").prepend( clipApp.disableDiv() );
	$("#actions").prepend( clipApp.disableDiv() );
	$("#save").prepend( clipApp.disableDiv() );
	
	// Get Params
	var params = {
		'entryId': clipApp.vars.entry.id,
		'mediaType': clipApp.vars.entry.mediaType,
		'name': $("#entry_title").val(),
		'desc': $("#entry_desc").val(),
		'start': $("#startTime").timeStepper( 'getValue' ),
		'end': $("#endTime").timeStepper( 'getValue' )
	};

	var saveUrl = 'save.php';
	if( clipApp.vars.config.length > 0 ) {
		var queryString = $.param( {
			'config': clipApp.vars.config,
			'partnerId': clipApp.vars.partner_id,
			'kclipUiconf': clipApp.vars.kclip_uiconf_id,
			'kdpUiconf': clipApp.vars.kdp_uiconf_id,
			'mode': ((clipApp.vars.overwrite_entry) ? 'trim' : 'clip')
		} );
		saveUrl += '?' + queryString;
	}

	// Make the request
	$.ajax({
		url: saveUrl,
		type: "post",
		data: params,
		dataType: "json",
		success: function(res) {
			$("#loader").fadeOut();
			if( res.error ) {
				alert(res.error);
			}
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
	$("#entry_title").val( clipApp.vars.entry.name );
	$("#entry_desc").val( clipApp.vars.entry.description );

	if( !clipApp.vars.overwrite_entry ) {
		$("#newclip").find('.disable').remove();
	}
	$("#fields").prepend( clipApp.disableDiv() );
	$("#actions").prepend( clipApp.disableDiv() );
	$("#save").prepend( clipApp.disableDiv() );	
};