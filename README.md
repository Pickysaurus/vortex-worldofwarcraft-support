# vortex-worldofwarcraft-support
Adds support for World of Warcraft and World of Warcraft Classic to Vortex. 

![Games Page in Vortex](https://i.imgur.com/mgWuW2Y.png)

## Current features: ##

* Supports World of Warcraft and World of Warcraft Classic as separate games.
* Curseforge can be opened inside Vortex at the bottom of the mods table. 
* Compatible with all CurseForge Addons that include a TOC file and are structured as expected.

![CurseForge option in Vortex](https://i.imgur.com/oJQGF6m.png)
![Browse CurseForge in Vortex](https://i.imgur.com/DqLJVRh.png)

## Current issues: ##

* Detection of WoW and WoW Classic are based on guesswork for registry keys. At least one of the two detections will not work properly.
* The installer function currently produces an error, so it is commented out.
* No support for mods that are not AddOns. 

## Possible Enhancements: ##

* Pull addon meta information about mod from CurseForge or the TOC file (this could be confusing if there are serveral TOC files though). 
* A "load order" tab allowing you to toggle addons on/off per character but editing the AddOns.txt found at `E:\World of Warcraft\_classic_\WTF\Account\<account_name>\<realm_name>\<character_name>\AddOns.txt`.
* The limits are your imagination.

Please feel free to clone this repo or create a PR is you'd like to improve it. 

## How to install ##
Download the contents of this repo and copy the files to `%AppData%/Vortex/Plugins/game-worldofwarcraft` (you will need to create the folders).
If someone wishes to take over this project, feel free to post it on Nexus Mods and it can be installed inside Vortex itself. 
