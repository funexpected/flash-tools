import { Rasterizer } from "../lib/rasterizer"

let rasterizer = new Rasterizer();
let root = fl.getDocumentDOM().getTimeline().libraryItem;
if (root) {
    rasterizer.rasterize(root);
    fl.getDocumentDOM().library.editItem(root.name);
} else {
    rasterizer.rasterize("document");
    fl.getDocumentDOM().editScene(0);
}
