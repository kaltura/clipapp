<?php

class Lang {

	const DEFAULT_LANG = 'en';

	var $messages = array();

	var $options = array(
		'directory' => 'languages',
		'ext' => 'json'
	);

	function __construct( $language = null, $options = array() ){

		if( !$language )
			throw new Exception('Error class Lang excepts $language as first parameter');
			
		$this->options = array_merge($this->options, $options);

		// If the current language does not exists and we have underscore in the name
		// Strip the country suffix
		if( !$this->exists( $language ) && strpos($language, "_") !== false ){
			$language = substr( $language, 0, 2);
		}
		// If we still don't have language, use the default one
		if( !$this->exists($language) ){
			$language = self::DEFAULT_LANG;
		}
		$this->load( $language );
	}

	function exists( $language ){
		return file_exists($this->path($language));
	}

	function path( $language ){
		return $this->options['directory'] . "/" . $language . "." . $this->options['ext'];
	}

	function load( $language ){
		$this->messages = json_decode( file_get_contents( $this->path($language) ), true );
	}

	function translate( $text = null ){
		if( isset($this->messages[ $text ]) ){
			return $this->messages[ $text ];
		}
		return $text;
	}
}