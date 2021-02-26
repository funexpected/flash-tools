# Funexpected Flash Tools

Performs Adobe Animate project rasterization && exporting for using with Godot Engine + [Flash Module](https://github.com/funexpected/godot-flash-module)

## Installation

### MacOS
Open Terminal application, paste this code, press `Enter`:
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/funexpected/flash-tools/master/install.sh)"
```
### Windows
[Download](https://github.com/funexpected/flash-tools/releases/latest/download/funexpected-tools.zip) latest Flash Tools release, unzip, copy `Funexpected Tools` folder into Adobe Animate `Configuration\Commands` directory:
```
<boot drive>\Users\username\AppData\Local\Adobe\Animate <version>\<language>\Configuration\Commands
```
> :warning: **Not tested on windows**: we have no windows machine and unable to test if Flash Tools fully usable on windows. While most parts of commands should work fine, compressing output project may be missed. In this case you need to compress resulting `*.fnx.export` folder using zip tool and change extension to `.zfl`. Please, report any issues or positive feedback.

## Usage

### Export
Export command prepare project for using it with Godot Engine. It runs in several phases
- save current project into temporary location
- rasterizes all assets (Symbols and Shapes)
- generate SpriteSheetes of rasterized assets
- removes unused data
- comress result

Source project leaves untouched, so this command is pretty safe.

Export can be done in three ways:
- **Document** exports main document and all dependencies.
- **Library** exports every root item of your library
- **Selected** exports current edited screen (scene or library item).

### Rasterize Current Screen
While `Export` command do not change your project, `Rasterize Current Screen` chnage your current project and prepare exacly same rastersization. It may be useful for speeding up export process of big projects.

## Roadmap

- [ ] add ability to automaticaly open exported project in godot for testing purposes
- [ ] support Warp Tool
- [ ] support sounds