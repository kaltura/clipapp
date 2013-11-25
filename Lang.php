<?php

class Lang {

	var $messages = array();

	var $options = array(
		'default' => 'en',
		'directory' => 'languages',
		'ext' => 'json'
	);

	function __construct( $language = null, $options = array() ){
			
		// Merge options with defaults
		$this->options = array_merge($this->options, $options);

		// If we didn't get a language use default
		if( !$language ){
			$language = $this->options['default'];
		}

		// If the current language does not exists and we have underscore in the name
		// Strip the country suffix en_US
		if( !$this->exists( $language ) && strpos($language, "_") !== false ){
			$language = substr( $language, 0, 2);
		}
		
		// If we still don't have language, use the default one
		if( !$this->exists($language) ){
			$language = $this->options['default'];
		}

		if( $this->exists($language) ){
			$this->load( $language );
		} else {
			throw new Exception("Language file: " . $this->path($language) . " not found!");
		}
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