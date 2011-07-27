<?php

// Initilize App
require_once('init.php');

// Get entryId from GET parameter or Config
$entryId = (isset($_GET['entryId']) ? htmlspecialchars($_GET['entryId']) : $conf['entry_id']);

// Create Kdp Url
$kdpUrl = 'http://' . $conf['host'] . '/kwidget/wid/_' . $conf['partner_id'] . '/uiconf_id/' . $conf['kdp']['uiconf_id'] . '/entry_id/' . $entryId;

// Create Clipper Url & Flashvars
$clipperUrl = 'http://' . $conf['host'] . '/kgeneric/ui_conf_id//' . $conf['clipper']['uiconf_id'];

$clipperFlashvars = '&entry_id=' . $entryId . '&partner_id=' . $conf['partner_id'] . '&host=' . $conf['host'];
$clipperFlashvars .= '&ks=' . $ks . '&show_add_delete_buttons=false&state=clippingState&jsReadyFunc=clipperReady';
$clipperFlashvars .= '&max_allowed_rows=1&show_control_bar=true&show_message_box=false';

if(!$entryId)
	die("Missing entry id");

// Load entry
try
{
	$entry = $client->baseEntry->get($entryId, null);
	$kdpUiconf = $client->uiConf->get($conf['kdp']['uiconf_id']);
}
catch(Exception $e)
{
	echo($e->getMessage());
}

?>
<html>
	<head>
		<title><?php echo $conf['title']; ?></title>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
		<script src="js/jquery.time.stepper.js"></script>
		<script src="js/clipApp.js"></script>
		<script>
		clipApp.init( {
				"host": "<?php echo $conf['host'];?>",
				"partner_id": "<?php echo $conf['partner_id'];?>",
				"entry": <?php echo json_encode($entry);?>,
				"ks": "<?php echo $ks;?>",
				"kdp": <?php echo json_encode($kdpUiconf);?>,
				"redirect_save": <?php echo ($conf['redirect_save']) ? 'true' : 'false'; ?>,
				"redirect_url": "<?php echo $conf['redirect_url']; ?>",
				"overwrite_entry": <?php echo ($conf['overwrite_entry']) ? 'true' : 'false'; ?>
		});
		</script>
		<!--<script src="/html5.kaltura/mwEmbed/mwEmbedLoader.php"></script>-->
		<link rel="stylesheet" type="text/css" href="css/style.css" />
	</head>
	<body>
		<h1><?php echo $conf['title']; ?></h1>
		<div id="force-html5"><a href="?forceMobileHTML5">HTML5</a></div>
		<object id="kdp3" name="kdp3" type="application/x-shockwave-flash" wmode="opaque" allowFullScreen="true" allowNetworking="all" allowScriptAccess="always" height="<?php echo $conf['kdp']['height']; ?>" width="<?php echo $conf['kdp']['width']; ?>" bgcolor="#000000" resource="<?php echo $kdpUrl; ?>" data="<?php echo $kdpUrl; ?>"><param name="allowFullScreen" value="true" /><param name="allowNetworking" value="all" /><param name="allowScriptAccess" value="always" /><param name="wmode" value="opaque" /><param name="bgcolor" value="#000000" /><param name="flashVars" value="&steamerType=rtmp" /><param name="movie" value="<?php echo $kdpUrl; ?>" /></object>
		<br />
		<?php if( $conf['overwrite_entry'] == false ) { ?>
			<div id="newclip"><input type="button" value="New Clip" disabled="disabled" /></div>
		<?php } ?>
		<div id="timers" class="clearfix">
			<div class="left"><input type="button" id="setStartTime" value="Set In Time" /></div>
			<div class="left right"><input type="button" id="setEndTime" value="Set Out Time" /></div>
		</div>
		<object id="clipper" name="clipper" type="application/x-shockwave-flash" wmode="opaque" allowNetworking="all" allowScriptAccess="always" height="<?php echo $conf['clipper']['height']; ?>" width="<?php echo $conf['clipper']['width']; ?>" data="<?php echo $clipperUrl; ?>"><param name="allowNetworking" value="all" /><param name="allowScriptAccess" value="always" /><param name="wmode" value="opaque" /><param name="bgcolor" value="#e4e4e4" /><param name="flashVars" value="<?php echo $clipperFlashvars; ?>" /><param name="movie" value="<?php echo $clipperUrl; ?>" /></object>
		<br />
		<div id="embed" class="form clearfix">
			<p><?php echo $conf['save_message']; ?></p><br />
			<div class="item clearfix">
				<label>Embed:</label>
				<input id="embedcode" type="text" value="" />
			</div><br />
		</div>
		<div id="form" class="form clearfix">
			<div class="item clearfix">
				<label>Start Time:</label>
				<input id="startTime" value="" />
			</div>
			<div class="item clearfix">
				<label>End Time:</label>
				<input id="endTime" value="" />
			</div>
			<div class="item clearfix">
				<label>Title:</label>
				<input id="entry_title" type="text" value="<?php echo $entry->name; ?>" /><br /><br />
			</div>
			<div class="item clearfix">
				<label>Description:</label>
				<textarea id="entry_desc"><?php echo $entry->description; ?></textarea><br /><br />
			</div>
		</div>
		<div id="actions"><input id="delete" type="button" value="Delete" />&nbsp;<input id="preview" type="button" value=" Preview " />&nbsp;<input id="save" type="button" value="Save" /><img id="loading" src="http://local.trunk/lib/images/kmc/loader.gif" /></div>
	</body>
</html>