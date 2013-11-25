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
2. Rename ```config.kmc.php``` to ```config.local.php``` run: 

  ```
  mv config.kmc.php config.local.php
  ```
3. Open KMC -> Entry Drilldown -> Trim / Clip
