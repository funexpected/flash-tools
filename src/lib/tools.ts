import * as path from "./path";

function createSpritesheetExporter(width: number, height: number, padding: number=8):SpriteSheetExporter {
    let spg = new SpriteSheetExporter();
    spg.algorithm = "maxRects";
    spg.allowRotate = false;
    spg.allowTrimming = false;
    spg.borderPadding = 2;
    spg.shapePadding = padding;
    spg.layoutFormat = "JSON";
    spg.autoSize = false;
    spg.sheetWidth = width;
    spg.sheetHeight = height;
    // if (limitSize) {
    // } else {
    //     spg.autoSize = true;
    //     spg.maxSheetHeight = width;
    //     spg.maxSheetWidth = height;
    // }
    return spg;
}

class SpriteSheetGenerationAttempt {
    public width: number = 0;
    public height: number = 0;
    public exporters: SpriteSheetExporter[] = [];
    public valid: boolean = true;

    public getSquare(): number {
        return (this.width * this.height) * Math.pow(this.exporters.length, 1.1);
    }
}

export function generateSpriteSheets(bitmaps: FlashBitmapItem[], padding: number = 8, maxPageSize: number = 4096){
    if (bitmaps.length == 0) return;
    normalizeLibrary(bitmaps);
    bitmaps = bitmaps.sort( (a, b) => b.hPixels * b.vPixels - a.hPixels * a.hPixels);

    let attempts: SpriteSheetGenerationAttempt[] = [];
    let sizes: number[] = [256, 512, 1024, 2048, 4096];
    while (sizes.length > 1 && sizes[sizes.length-1] > maxPageSize) {
        sizes.pop()
    }
    while (sizes.length > 1) {
        let size = sizes[0];
        if (bitmaps.some(b => b.hPixels > size - 4 || b.vPixels > size - 4)) {
            sizes.shift();
        } else {
            break;
        }
    }
    while (sizes.length > 2) {
        sizes.pop();
    }

    // try to pack atlases with different page size and choose best shot
    for (let width of sizes) {
        for (let height of sizes) {
            let attempt = new SpriteSheetGenerationAttempt();
            attempt.width = width;
            attempt.height = height;
            
            for (let bitmap of bitmaps) {
                if (bitmap.hPixels > width - 4 || bitmap.vPixels > height - 4) {
                    let itemSrcString = bitmap.hasData("originalSource") ? 
                        `item rasterized from ${bitmap.getData("originalSource")}` :
                        `bitmap ${bitmap.sourceFilePath}`;
                    fl.trace(`Skipping big bitmap, cant pack ${itemSrcString}`);
                    continue;
                }
                let exporter: null|SpriteSheetExporter = null;
                
                for (let i=attempt.exporters.length-1; i >= 0; i--) {
                    let exp = attempt.exporters[i];
                    exp.addBitmap(bitmap);
                    if (exp.overflowed) {
                        exp.removeBitmap(bitmap);
                    } else {
                        exporter = exp;
                        break;
                    }
                }
                if (!exporter) {
                    //fl.trace(`creating exporter ${maxWidth}x${maxHeight}`);
                    exporter = createSpritesheetExporter(width, height, padding);
                    attempt.exporters.push(exporter);
                    exporter.addBitmap(bitmap);
                    //fl.trace("creating new exporter");
                }
                if (attempt.exporters.length > 1024) {
                    attempt.valid = false;
                    fl.trace(`Too many spritesheets for size ${width}x${height}, skipping`);
                    break;
                }
            }

            if (attempt.valid) {
                attempts.push(attempt);
            }
        }
    }

    let exporters = attempts.sort( (a, b) => a.getSquare() - b.getSquare())[0].exporters;
    let baseUri =  "file://" + path.base(fl.getDocumentDOM().path);
    let idx = 0;
    let exportedSpriteSheets = "";
    //fl.trace(`created ${exporters.length} spritesheets`);

    for (let exporter of exporters) {
        let spriteSheetData = exporter.exportSpriteSheet(`${baseUri}/spritesheet_${idx}`, {
            format: "png",
            backgroundColor: "#00000000",
            bitDepth: 32
        }, true);
        //FLfile.write(`${baseUri}/spritesheet_${idx}.json`, spriteSheetData);
        //fl.trace(`layout ${idx}: ${spriteSheetData}`);
        exportedSpriteSheets += `spritesheet_${idx}\n`
        idx += 1;
    }
    if (exportedSpriteSheets) {
        FLfile.write(`${baseUri}/spritesheets.list`, exportedSpriteSheets);
    }
}

// as far as SpriteSheetExporter cuts folders names, we need
// to rename and move bitmaps to own folder
function normalizeLibrary(bitmaps: FlashBitmapItem[]) {
    let lib = fl.getDocumentDOM().library;
    let basePath = `file://${path.base(fl.getDocumentDOM().path)}/LIBRARY`;
    let idx = 0;
    lib.newFolder("gdexp");
    for (let bitmap of bitmaps) {
        if (!bitmap.hasData("originalSource")) bitmap.addData("originalSource", "string", `bitmap at ${bitmap.name}`);
        lib.selectItem(bitmap.name, true);
        let itemName = `bitmap.exported.${idx.toString().padStart(4, '0')}`;
        lib.renameItem(itemName);
        lib.moveToFolder("gdexp");
        idx += 1;
    }
}
// MIT License

// Copyright (c) 2021 Yakov Borevich, Funexpected LLC

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


// removes bin folder & clears images from library (all required images are stored in atlases already)
export function cleanUpProject(path: String) {
    FLfile.remove(`file://${path}bin/`)
    let rootUri = `file://${path}LIBRARY/`;
    let dirs = [""];

    while (dirs.length) {
        let currentDir = dirs.pop() as string;
        let currentUri = rootUri + currentDir;
        for (let dir of FLfile.listFolder(currentUri, "directories")) {
            dirs.push(`${currentDir}${dir}/`);
        }
        for (let file of FLfile.listFolder(currentUri, "files")) {
            if (file.endsWith(".png") || file.endsWith(".jpeg") || file.endsWith(".jpg")) {
                //fl.trace(`remofing ${currentUri}${file}`);
                FLfile.remove(`${currentUri}${file}`);
            }
        }
    }
}

// invokes toolkig command
export function invoke(command: string, args:{ [id: string] : string; } = { }) {
    let isOSX = (fl.version.indexOf("MAC") != -1);
    let doc = fl.getDocumentDOM();
    let toolkitPath = `${fl.configDirectory}Commands/Funexpected Tools/toolkit`;
    if (!isOSX) toolkitPath += ".exe";
    let cmd = `"${toolkitPath}" ${command}`;
    for (let arg in args) {
        cmd += ` --${arg} "${args[arg]}"`;
    }
    //fl.trace("executing " + cmd);
    FLfile.runCommandLine(cmd);
}