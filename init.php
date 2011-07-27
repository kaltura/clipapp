<?php

// Load configuration
require_once('config.php');

// Load Kaltura Client
require_once('client/KalturaClient.php');

try {
	// Return a Client
	$config = new KalturaConfiguration( $conf['partner_id'] );
	$config->serviceUrl = 'http://' . $conf['host'];
	$client = new KalturaClient( $config );
	// Create & Set KS
	$ks = $client->session->start($conf['usersecret'], $conf['user_id'], null, $conf['partner_id'], null, null);
	$client->setKs($ks);
} catch( Exception $e ){
	$error = '<h1>Error</h1>' . $e->getMessage();
	die($error);
}
// Reset admin secret just in case
$conf['usersecret'] = null;
