//import @types/
//console.log("Hello world!");
//import { basename } from "/path";
//import "jsfl";

import * as path from "./path";
import { canExportItem, canExportLayer } from "./types";




// function rasterizeProject(): FlashBitmapItem[] {
//     let doc = fl.getDocumentDOM();
//     // TODO: add root lib items also
//     let itemsToRasterize: FlashItem[] = doc.library.items
//         .filter(item => item.name.indexOf("/") < 0)
//         .filter(item => EditableItemTypes.some(t => item.itemType == t));
//     let rasterizedItems: { [id: string] : boolean; } = {};
//     let bitmapItems: { [id: string] : boolean; } = {};

//     let rasterize = function(itemName: string): boolean {
//         let doc = fl.getDocumentDOM();
//         let timeline = doc.getTimeline();
        
//         for (let layerIdx = 0; layerIdx < timeline.layers.length; layerIdx++) {
//             let layer = timeline.layers[layerIdx];
//             if (IgnorableLabelTypes.some(l => l == layer.layerType)) continue;
//             layer.locked = false;
//             layer.visible = true;
//             layer.outline = false;


//             for (let frameIdx = 0; frameIdx < layer.frames.length; frameIdx++) {
//                 let frame = layer.frames[frameIdx];
//                 if (frameIdx != frame.startFrame) continue;
                
//                 let hasShapes = frame.elements.some(e => e.elementType == FlashElementType.SHAPE);

//                 while (hasShapes) {
//                     timeline.setSelectedLayers(layerIdx, true);
//                     timeline.setSelectedFrames(frameIdx, frameIdx, true);
                    
//                     let shapes = doc.selection.filter(e => e.elementType == FlashElementType.SHAPE).map(e => e as FlashShape);
//                     // no shapes left in the frame, go next
//                     if (shapes.length == 0) break;
                    
//                     // DrawingObjects and groups with Instances should be splited
//                     let shapesToBreak = shapes.filter(e => e.isDrawingObject || e.isGroup && e.members.some(m => m.elementType == FlashElementType.INSTANCE))
//                     if (shapesToBreak.length > 0) {
//                         doc.selectNone();
//                         doc.selection = [shapesToBreak[0]];
//                         doc.breakApart();
//                         continue;
//                     }

                    
//                     let converted = false;
//                     // only single shape in the frame
//                     if (doc.selection.length == 1) { 
//                         converted = fl.getDocumentDOM().convertSelectionToBitmap();
                    
//                     // some black magic needed otherwise
//                     } else {
//                         doc.selection.forEach(e => e.selected = false);
//                         let shape = shapes[0];
//                         doc.selection = [shape];
//                         let depth = shape.depth;
//                         converted = fl.getDocumentDOM().convertSelectionToBitmap();

//                         // after rasterization element moves to the front
//                         // move it to original position here
//                         let lastDepth = doc.selection.length > 0 ? doc.selection[0].depth : 0;
//                         while (doc.selection.length > 0 && doc.selection[0].depth < depth) {
//                             doc.arrange("back");
//                             if (doc.selection[0].depth == lastDepth) {
//                                 break;
//                             }
//                         }
//                     }

//                     if (converted) {
//                         if (doc.selection.length && doc.selection[0].elementType == FlashElementType.INSTANCE) {
//                             let instance = doc.selection[0] as FlashInstance;
//                             if (instance.libraryItem?.itemType == FlashItemType.BITMAP) {
//                                 let item = instance.libraryItem as FlashBitmapItem;
//                                 item.addData("originalSource", "string", `${itemName}@${layer.name} at frame ${frame.startFrame}`);
//                             }
//                         }
//                     } else {
//                         fl.trace(`Can't convert to bitmap elements from ${itemName}@${layer.name} at frame ${frame.startFrame}`);
//                     }
//                 }
//                 for (let element of frame.elements) {
//                     if (element.elementType == FlashElementType.INSTANCE) {
//                         let instance = element as FlashInstance;
//                         if (EditableItemTypes.some(i => i == instance.libraryItem?.itemType)) {
//                             itemsToRasterize.push(instance.libraryItem as FlashItem);
//                         } else if (instance.libraryItem?.itemType == FlashItemType.BITMAP) {
//                             let item = instance.libraryItem as FlashBitmapItem;
//                             bitmapItems[item.name] = true;
//                         }
//                     }
//                 }
//             }
//         }
//         return true;
//     }
//     // rasterize document
//     rasterize("document");

//     let attempts: { [id: string] : number; } = {};
//     // rasterize rest items
//     while (itemsToRasterize.length) {
//         let item = itemsToRasterize.pop() as FlashItem;
//         if (item.name in rasterizedItems) continue;
//         rasterizedItems[item.name] = true;        
//         doc.library.editItem(item.name);
//         if (!rasterize(item.name)) {
//             if (item.name in attempts) {
//                 attempts[item.name] = 0;
//             }
//             attempts[item.name] += 1;
//             if (attempts[item.name] > 5) {
//                 fl.trace(`Too many attempts for distributeing for ${item.name}`);
//                 throw("Endless loop");
//             }

//             itemsToRasterize.unshift(item);
//             delete rasterizedItems[item.name];
//         }
        
//     }
//     let baseUri = "file://" + path.base(fl.getDocumentDOM().path) + "/LIBRARY/";
//     let result: FlashBitmapItem[] = [];
//     for (let item of fl.getDocumentDOM().library.items.filter(item => item.name in bitmapItems)) {
//         let bitmap = item as FlashBitmapItem;
//         let bitmapUri = baseUri + bitmap.name;
//         if (!bitmapUri.endsWith(".png")) bitmapUri += ".png";
//         result.push(bitmap);
//         bitmap.exportToFile(bitmapUri);
//     }
//     return result;
// }

function nextPowerOfTwo(val: number): number {
    let num = 2;
    while (num < val) {
        num *= 2;
    }
    return num;
}

function createSpritesheetExporter(width: number, height: number, limitSize=false):SpriteSheetExporter {
    let spg = new SpriteSheetExporter();
    spg.algorithm = "maxRects";
    spg.allowRotate = false;
    spg.allowTrimming = false;
    spg.borderPadding = 2;
    spg.shapePadding = 4;
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

export function createSpritesheet(bitmaps: FlashBitmapItem[]){
    if (bitmaps.length == 0) return;
    bitmaps = bitmaps.sort( (a, b) => b.hPixels * b.vPixels - a.hPixels * a.hPixels);

    let attempts: SpriteSheetGenerationAttempt[] = [];
    let sizes: number[] = [256, 512, 1024, 2048, 4096];
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

    fl.trace(`Try to pack atlases, possible page sizes: ${sizes}`);
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
                //for (let exp of attempt.exporters) {
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
                    exporter = createSpritesheetExporter(width, height, attempt.exporters.length > 0);
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

export function normalizeLibrary(bitmaps: FlashBitmapItem[]) {
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

// Mixed shape & instances, try tor distribute to layers from pers_1@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from pers_2@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from pers_2@Layer_1 at frame 2
// Mixed shape & instances, try tor distribute to layers from pers_3@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from pers_5@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Папка повторяющихся элементов/Символ 15 copy 2@Layer_3 at frame 0
// Mixed shape & instances, try tor distribute to layers from Символ 4 - копия copy 3@Слой_7 at frame 3
// Mixed shape & instances, try tor distribute to layers from Символ 4 - копия copy 3@Слой_7 at frame 4
// Mixed shape & instances, try tor distribute to layers from Символ 4 - копия copy 3@Слой_7 at frame 6
// Mixed shape & instances, try tor distribute to layers from Символ 4 - копия copy 3@Слой_7 at frame 14
// Mixed shape & instances, try tor distribute to layers from Символ 4 - копия copy 3@Слой_7 at frame 44
// Mixed shape & instances, try tor distribute to layers from Символ 4 - копия copy 3@Слой_7 at frame 73
// Mixed shape & instances, try tor distribute to layers from Символ 3 - копия@Слой_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 15 copy 4@Layer_3 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 2@Слой_7 at frame 3
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 2@Слой_7 at frame 4
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 2@Слой_7 at frame 6
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 2@Слой_7 at frame 14
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 2@Слой_7 at frame 44
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 2@Слой_7 at frame 73
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 3 - копия copy 2@Слой_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 5 copy 3@Layer_5 at frame 7
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 5 copy 3@Layer_4 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 5 copy 3@Layer_4 at frame 1
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 5 copy 3@Layer_4 at frame 2
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 5 copy 3@Layer_4 at frame 5
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 5 copy 3@Layer_4 at frame 8
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 13 copy 6@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Symbol 77@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 4 copy@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 4 copy@Layer_1 at frame 3
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Symbol 3@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Symbol 21@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Symbol 60 copy@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Symbol 23@Layer_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 15 copy 3@Layer_3 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 15 copy@Layer_3 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy@Слой_7 at frame 3
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy@Слой_7 at frame 4
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy@Слой_7 at frame 6
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy@Слой_7 at frame 14
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy@Слой_7 at frame 44
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy@Слой_7 at frame 73
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 3 - копия copy@Слой_1 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 15 copy 2@Layer_3 at frame 0
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 3@Слой_7 at frame 3
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 3@Слой_7 at frame 4
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 3@Слой_7 at frame 6
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 3@Слой_7 at frame 14
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 3@Слой_7 at frame 44
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 4 - копия copy 3@Слой_7 at frame 73
// Mixed shape & instances, try tor distribute to layers from Duplicate Items Folder/Символ 3 - копия@Слой_1 at frame 0

// export function debugActiveTimeLine() {
//     fl.outputPanel.clear();
//     fl.trace("rasterazing " + fl.getDocumentDOM());
//     let lib = fl.getDocumentDOM().library;
//     let root = fl.getDocumentDOM().getTimeline().libraryItem;
    
//     //let startItem = "Duplicate Items Folder/<Path>_24"
//     //let startItem = "Symbol 23";
//     //let startItem = "Символ 3 - копия";
//     //let startItem = "Символ 4 - копия copy 3"
//     //let startItem = "Duplicate Items Folder/Symbol 13 copy 6";
//     //let startItem = "Symbol 21"
//     let itemsToRasterize: FlashItem[] = [];
//     if (root) {
//         itemsToRasterize.push(root);
//     } else {

//     }

//     let rasterizedItems: { [id: string] : boolean; } = {};
//     while (itemsToRasterize.length > 0) {
//         let item = itemsToRasterize.shift() as FlashItem;
//         let itemName = item ? item.name : "[Document]";
//         if (itemName in rasterizedItems) {
//             continue;
//         }
//         rasterizedItems[itemName] = true;
//         if (itemName != "[Document]") lib.editItem(item.name);
//         let doc = fl.getDocumentDOM();
//         fl.trace(`editing item ${itemName}`);
//         let timeline = fl.getDocumentDOM().getTimeline();

//         for (let layerIdx = 0; layerIdx < timeline.layers.length; layerIdx++) {
//             let layer = timeline.layers[layerIdx];
//             fl.trace(`  working with layer ${layer.name}`);
//             if (IgnorableLabelTypes.some(l => l == layer.layerType)) continue;
//             layer.locked = false;
//             layer.visible = true;
//             layer.outline = false;


//             for (let frameIdx = 0; frameIdx < layer.frames.length; frameIdx++) {
//                 let frame = layer.frames[frameIdx];
//                 if (frameIdx != frame.startFrame) continue;

//                 let hasShapes = frame.elements.some(e => e.elementType == FlashElementType.SHAPE);

//                 while (hasShapes) {
//                     timeline.setSelectedLayers(layerIdx, true);
//                     timeline.setSelectedFrames(frameIdx, frameIdx, true);
//                     //fl.trace(`selected items ${doc.selection.map(e => e.elementType)}`);
                    
//                     let shapes = doc.selection.filter(e => e.elementType == FlashElementType.SHAPE).map(e => e as FlashShape);
//                     let shapesToBreak = shapes.filter(e => e.isDrawingObject || e.isGroup && e.members.some(m => m.elementType == FlashElementType.INSTANCE))
//                     //shapes.forEach(s => fl.trace(s.members.map(m => m.elementType)));
//                     if (shapesToBreak.length > 0) {
//                         doc.selectNone();
//                         doc.selection = [shapesToBreak[0]];
//                         doc.breakApart();
//                         continue;
//                     }
                    
//                     let converted = false;
//                     if (shapes.length == 0) break;
//                     if (doc.selection.length > 1) { 
//                         doc.selection.forEach(e => e.selected = false);
//                         let shape = shapes[0];
//                         doc.selection = [shape];
//                         let depth = shape.depth;
//                         converted = fl.getDocumentDOM().convertSelectionToBitmap();
//                         let lastDepth = doc.selection.length > 0 ? doc.selection[0].depth : 0;
//                         while (doc.selection.length > 0 && doc.selection[0].depth < depth) {
//                             doc.arrange("back");
//                             if (doc.selection[0].depth == lastDepth) {
//                                 break;
//                             }
//                         }
//                     } else {
//                         converted = fl.getDocumentDOM().convertSelectionToBitmap();
//                     }

//                     if (!converted) {
//                         fl.trace(`Can't convert to bitmap elements from ${item.name}@${layer.name} ar frame ${frame.startFrame}`);
//                         return;
//                     } else {
//                         //fl.trace(`    item converted ${item.name}/${layer.name}/${frame.startFrame}, shape type: ${doc.selection[0].elementType}`);
//                     }
//                 }
//                 for (let element of frame.elements) {
//                     if (element.elementType == FlashElementType.INSTANCE) {
//                         let instance = element as FlashInstance;
//                         if (EditableItemTypes.some(i => i == instance.libraryItem?.itemType)) {
//                             itemsToRasterize.push(instance.libraryItem as FlashItem);
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     if (root) {
//         lib.editItem(root.name);
//     } else {
//         fl.getDocumentDOM().editScene(0);
//     }

// }

// function _duplicateAndexportProject(){
//     debugActiveTimeLine();
// }

// export function duplicateAndexportProject() {
//     fl.outputPanel.clear();
//     fl.showIdleMessage(false);

//     let originalDoc = fl.getDocumentDOM();
//     let originalUri = "file://" + originalDoc.path;
//     originalDoc.save(false);
    
//     let exportProjectDir = path.base(originalDoc.path) + ".export/";
//     let exportProjectArchive = path.base(originalDoc.path) + ".zfl";
//     let exportProjectPath = exportProjectDir + path.file(originalDoc.path).replace(".xfl", ".export.xfl");
//     let exportProjectDirUri = "file://" + exportProjectDir;
//     let exportProjectPathUri = "file://" + exportProjectPath;
//     if (FLfile.exists(exportProjectDirUri)) FLfile.remove(exportProjectDirUri);
//     FLfile.createFolder(exportProjectDirUri);
//     fl.trace("Exporting project");
//     fl.trace("Worrrking with " + exportProjectPathUri);
//     fl.saveDocument(originalDoc, exportProjectPathUri);
//     fl.openDocument(exportProjectPathUri);
    

//     let doc = fl.getDocumentDOM();
//     let rasterizer = new Rasterizer();
//     let bitmaps = rasterizer.rasterize();
//     normalizeLibrary(bitmaps);
//     createSpritesheet(bitmaps);

//     fl.saveDocument(doc);
//     fl.closeDocument(doc);
//     fl.openDocument(originalUri);


//     // cleanup exported project
//     cleanUpProject(exportProjectDir);
//     try {
//         ZipFile.compress(exportProjectDir, exportProjectArchive);
//     } finally {
//         fl.trace("comressed");
//     }
//     alert("Document exported to " + exportProjectPath);

// }


//duplicateAndexportProject();