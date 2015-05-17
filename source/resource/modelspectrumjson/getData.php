<?php
include_once("util/sanitize.php");

$wfo = isset($_REQUEST["wfo"]) ? sanitize($_REQUEST["wfo"], "PARANOID") : '';
$site = isset($_REQUEST["site"]) ? sanitize($_REQUEST["site"], "PARANOID") : '';
$field = isset($_REQUEST["field"]) ? sanitize($_REQUEST["field"], "PARANOID") : '';
$json_url = "http://www.weather.gov/source/".$wfo."/modelspectrum/".$field."_".$site.".json";

//echo $json_url;
// Initializing curl
$ch = curl_init( $json_url );

// Configuring curl options
$options = array(
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_HTTPHEADER => array('Content-type: application/json')// ,
);

// Setting curl options
curl_setopt_array( $ch, $options );

// Getting results
$result =  curl_exec($ch);
echo $result;

?>