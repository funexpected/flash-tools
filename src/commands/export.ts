import * as path from "../lib/path";
import { Rasterizer } from "../lib/rasterizer";
import { normalizeLibrary, cleanUpProject, createSpritesheet } from "../lib/tools";

fl.outputPanel.clear();
fl.showIdleMessage(false);

let originalDoc = fl.getDocumentDOM();
let originalUri = "file://" + originalDoc.path;
originalDoc.save(false);

let exportProjectDir = path.base(originalDoc.path) + ".export/";
let exportProjectArchive = path.base(originalDoc.path) + ".zfl";
let exportProjectPath = exportProjectDir + path.file(originalDoc.path).replace(".xfl", ".export.xfl");
let exportProjectDirUri = "file://" + exportProjectDir;
let exportProjectPathUri = "file://" + exportProjectPath;
if (FLfile.exists(exportProjectDirUri)) FLfile.remove(exportProjectDirUri);
FLfile.createFolder(exportProjectDirUri);
fl.trace("Exporting project");
fl.trace("Worrrking with " + exportProjectPathUri);
fl.saveDocument(originalDoc, exportProjectPathUri);
fl.openDocument(exportProjectPathUri);


let doc = fl.getDocumentDOM();
let rasterizer = new Rasterizer();
let bitmaps = rasterizer.rasterize("document");
normalizeLibrary(bitmaps);
createSpritesheet(bitmaps);

fl.saveDocument(doc);
fl.closeDocument(doc);
fl.openDocument(originalUri);


// cleanup exported project
cleanUpProject(exportProjectDir);
try {
    ZipFile.compress(exportProjectDir, exportProjectArchive);
    alert("Document exported to " + exportProjectArchive);
} catch {
    alert("Document exported to " + exportProjectDir);
    fl.trace(
        `ZipFile library not found, project not archived. ` +
        `To use exported project in Godot you need to compress ${exportProjectDir} ` +
        `using Zip and rename to ${exportProjectArchive}`
    );
}
