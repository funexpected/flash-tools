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
