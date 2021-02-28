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



import * as path from "./path";
import { canExportItem, canExportLayer } from "./types";

export class Rasterizer {
    itemsToRasterize: FlashItem[] = [];
    rasterizedItems: { [id: string] : boolean; } = {};
    bitmapItems: { [id: string] : boolean; } = {};

    public rasterize(rootItem: FlashItem|"document"|null = null, withLibraryRootItems: boolean = false, exportBitmaps: boolean = false): FlashBitmapItem[] {
        let doc = fl.getDocumentDOM();
        
        if (withLibraryRootItems) {
            this.itemsToRasterize = doc.library.items
                .filter(item => item.name.indexOf("/") < 0)
                .filter(canExportItem);
        }

        if (rootItem == "document") {
            doc.editScene(0);
            this.rasterizeItem("document");
        } else if (rootItem != null) {
            this.itemsToRasterize.push(rootItem);
        }

        // rasterize rest items
        while (this.itemsToRasterize.length) {
            let item = this.itemsToRasterize.pop() as FlashItem;
            if (item.name in this.rasterizedItems) continue;
            this.rasterizedItems[item.name] = true;        
            doc.library.editItem(item.name);
            this.rasterizeItem(item.name);
        }

        let baseUri = FLfile.platformPathToURI(path.base(fl.getDocumentDOM().path) + "/LIBRARY/");
        let result: FlashBitmapItem[] = [];
        for (let item of fl.getDocumentDOM().library.items.filter(item => item.name in this.bitmapItems)) {
            let bitmap = item as FlashBitmapItem;
            let bitmapUri = baseUri + bitmap.name;
            if (!bitmapUri.endsWith(".png")) bitmapUri += ".png";
            if (exportBitmaps) bitmap.exportToFile(bitmapUri);
            
            result.push(bitmap);
        }

        return result;
    }

    rasterizeItem(itemName: string) {
        let doc = fl.getDocumentDOM();
        let timeline = doc.getTimeline();
        
        for (let layerIdx = 0; layerIdx < timeline.layers.length; layerIdx++) {
            let layer = timeline.layers[layerIdx];
            if (!canExportLayer(layer)) continue;
            layer.locked = false;
            layer.visible = true;
            layer.outline = false;


            for (let frameIdx = 0; frameIdx < layer.frames.length; frameIdx++) {
                let frame = layer.frames[frameIdx];
                if (frameIdx != frame.startFrame) continue;
                
                let hasShapes = frame.elements.some(e => e.elementType == "shape");

                while (hasShapes) {
                    timeline.setSelectedLayers(layerIdx, true);
                    timeline.setSelectedFrames(frameIdx, frameIdx, true);
                    
                    let shapes = doc.selection.filter(e => e.elementType == "shape").map(e => e as FlashShape);
                    // no shapes left in the frame, go next
                    if (shapes.length == 0) break;
                    
                    // DrawingObjects and groups with Instances should be splited
                    let shapesToBreak = shapes.filter(e => e.isDrawingObject || e.isGroup && e.members.some(m => m.elementType == "instance"))
                    if (shapesToBreak.length > 0) {
                        doc.selectNone();
                        doc.selection = [shapesToBreak[0]];
                        doc.breakApart();
                        continue;
                    }

                    
                    let converted = false;
                    // only single shape in the frame
                    if (doc.selection.length == 1) { 
                        converted = fl.getDocumentDOM().convertSelectionToBitmap();
                    
                    // some black magic needed otherwise
                    } else {
                        doc.selection.forEach(e => e.selected = false);
                        let shape = shapes[0];
                        doc.selection = [shape];
                        let depth = shape.depth;
                        converted = fl.getDocumentDOM().convertSelectionToBitmap();

                        // after rasterization element moves to the front
                        // move it to original position here
                        let lastDepth = doc.selection.length > 0 ? doc.selection[0].depth : 0;
                        while (doc.selection.length > 0 && doc.selection[0].depth < depth) {
                            doc.arrange("back");
                            if (doc.selection[0].depth == lastDepth) {
                                break;
                            }
                        }
                    }

                    if (converted) {
                        if (doc.selection.length && doc.selection[0].elementType == "instance") {
                            let instance = doc.selection[0] as FlashInstance;
                            if (instance.libraryItem?.itemType == "bitmap") {
                                let item = instance.libraryItem as FlashBitmapItem;
                                item.addData("originalSource", "string", `${itemName}@${layer.name} at frame ${frame.startFrame}`);
                            }
                        }
                    } else {
                        fl.trace(`Can't convert to bitmap elements from ${itemName}@${layer.name} at frame ${frame.startFrame}`);
                    }
                }
                for (let element of frame.elements) {
                    if (element.elementType == "instance") {
                        let instance = element as FlashInstance;
                        if (canExportItem(instance.libraryItem)) {
                            this.itemsToRasterize.push(instance.libraryItem as FlashItem);
                        } else if (instance.libraryItem?.itemType == "bitmap") {
                            let item = instance.libraryItem as FlashBitmapItem;
                            this.bitmapItems[item.name] = true;
                        }
                    }
                }
            }
        }
    }
}
