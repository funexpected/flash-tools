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


import * as path from "../lib/path";
import { Rasterizer } from "../lib/rasterizer";
import { ExportSettingsDialog } from "../lib/dialogs/export_settings"
import { cleanUpProject, generateSpriteSheets, invoke } from "../lib/tools";

let dialog = new ExportSettingsDialog();
let settings = dialog.prompt();
if (settings) {
    let doc = fl.getDocumentDOM();
    let editedItemName = doc.getTimeline().libraryItem?.name || "document";

    fl.outputPanel.clear();
    fl.showIdleMessage(false);
        
    let originalDoc = fl.getDocumentDOM();
    let originalUri = "file://" + originalDoc.path;
    originalDoc.save(false);
    
    let exportProjectArchive = settings.exportPath;
    let exportProjectDir = path.getProjectPrefix() + ".fnx.export/";
    let exportProjectPath = exportProjectDir + path.file(exportProjectDir) + ".xfl";
    let exportProjectDirUri = "file://" + exportProjectDir;
    let exportProjectPathUri = "file://" + exportProjectPath;
    if (FLfile.exists(exportProjectDirUri)) FLfile.remove(exportProjectDirUri);
    FLfile.createFolder(exportProjectDirUri);
    fl.trace("Exporting project");
    fl.trace("Worrrking with " + exportProjectPathUri);
    fl.saveDocument(originalDoc, exportProjectPathUri);
    fl.openDocument(exportProjectPathUri);

    let editedItem: "document"|FlashItem = editedItemName == "document" ? "document" : (doc.library.items.filter(i => i.name == editedItemName)[0] as FlashItem);
    let rasterizer = new Rasterizer();
    let bitmaps = rasterizer.rasterize(settings.exportType == "library" ? null : editedItem, settings.exportType == "library");
    generateSpriteSheets(bitmaps, settings.padding, settings.pageSize);

    fl.saveDocument(doc);
    fl.closeDocument(doc);
    fl.openDocument(originalUri);

    // cleanup exported project
    cleanUpProject(exportProjectDir);
    for (let p in FLfile) {
        fl.trace("FLfile." + p);
    }

    invoke("compress", {
        source: exportProjectDir,
        destination: exportProjectArchive
    });
    alert("Document exported to " + exportProjectArchive);
}
