<?php

// Initilize App
require_once('init.php');

// Params
$overwrite = $conf['overwrite_entry'];

// Entry Data
$entryId = $_POST['entryId'];
$entryName = $_POST['name'];
$entryDesc = $_POST['desc'];

// Clip Data
$startTime = $_POST['start'];
$endTime = $_POST['end'];
$clipDuration = $endTime - $startTime;

// Create New Clip
$operation1						= new KalturaClipAttributes();
$operation1->offset				= $startTime;
$operation1->duration			= $clipDuration;

// Add New Resource
$resource						= new KalturaOperationResource();
$resource->resource				= new KalturaEntryResource();
$resource->resource->entryId	= $entryId;
$resource->operationAttributes	= array($operation1);

// Create New Media Entry
$entry					= new KalturaMediaEntry();
$entry->name			= $entryName;
$entry->description		= $entryDesc;

if( $overwrite ) {
	// Trim Entry
	$resultEntry = $client->media->update($entryId, $entry);
	try {
		$resultEntry = $client->media->updateContent($resultEntry->id, $resource);
	} catch( Exception $e ){
		die('{"error": "' . $e->getMessage() . '"}');
	}
} else {;
	$entry->mediaType = intval($_POST['mediaType']);

	// New Clip
	$resultEntry = $client->media->add($entry);
	$resultEntry = $client->media->addContent($resultEntry->id, $resource);
}

echo json_encode($resultEntry);
exit();
