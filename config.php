<?php

$config = array( 'default' => array() );

/* Friendly name for Clipping Application */
$config['default']['title'] = 'Clipping Application';

/*
 * Service Host URL
 * Description: Service host url, used by client and where we load the kdp & clipper swf files
 * Default: www.kaltura.com
 */
$config['default']['host'] = 'www.kaltura.com';

/*
 * Partner ID
 * You can get it from KMC > Settings > Integration Settings
 */
$config['default']['partner_id'] = '';

/*
 * User Secret
 * You can get it from KMC > Settings > Integration Settings
 */
$config['default']['usersecret'] = '';

/*
 * User ID
 * You can get it from KMC > Settings > My User Settings
 */
$config['default']['user_id'] = '';

/*
 * Default Entry Id
 * You can also use 'entryId' GET parameter to overwrite it
 * EX: http://localhost/ClipApp/?entryId=1_sfrj36g3
 */
$config['default']['entry_id'] = '';

/*
 * Overwrite Entry
 * true - Trimming, when user save the clip it will replace the current entry
 * false - Clipping, when user save the clip, it will create new entry
 */
$config['default']['overwrite_entry'] = false;

/* Redirect the user after save: true/false */
$config['default']['redirect_save'] = false;

/* Redirect URL if 'redirect_save' is true */
$config['default']['redirect_url'] = 'http://www.kaltura.com';

/* Message the will appear after the user click 'Save' button */
$config['default']['save_message'] = 'A new clip is now being created. This might take a few minutes. You can copy the embed code and the video will
play once the clip is ready.';

/* Use HTML5 Embed code: true/false */
$config['default']['html5_embed'] = true;

/* KDP Data */
$config['default']['kdp'] = array(
	'uiconf_id' => '',
	'width' => 640,
	'height' => 380
);

/* Clipper Data */
$config['default']['clipper'] = array(
	'uiconf_id' => '',
	'width' => 640,
	'height' => 150
);

/* FROM THIS POINT DO NOT EDIT THE CODE */

if( file_exists('config.local.php') )
	include('config.local.php');

if( isset($_GET['config']) ) {
	$configName = $_GET['config'];
} else {
	$configName = 'default';
}

if( $configName != 'default' && isset($config[$configName]) ) {
	$conf = array_merge( $config['default'], $config[$configName] );
} else {
	$conf = $config['default'];
}