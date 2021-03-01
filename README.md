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

- [ ] add docs and tutorials
- [x] convert Canvas-based documents into legacy before exporting
- [ ] add `About` and `Check For Updates` commands
- [ ] add ability to automaticaly open exported project in godot for testing purposes
- [ ] support Warp Tool
- [ ] support sounds