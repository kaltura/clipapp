ClipApp
========

ClipApp is Kaltura Clipping and Trimming application. The app allows you to trim and clip Kaltura entries.

## Installtation 

#### Standalone

1. Clone this repo into web accessible folder such as ```htdocs``` or ```www```
2. Edit ```config.php``` with your Kaltura credentials.
3. Open your browser at: ```http://localhost/clipapp/index.php?entryId={YOUR ENTRY ID HERE}``` 

#### In Kaltura Managment Console (KMC)

1. Download specific tag into ```/opt/kaltura/apps/clipapp/{version}```
2. Open KMC -> Entry Drilldown -> Trim / Clip

If you would like to change the settings you can create a config.local.php file with settings specific to your enviornment. 
