import * as path from "../path";

class ExportSettings {
    exportType: "document"|"library"|"selected" = "library";
    exportPath: string = "";
    padding: number = 8;
    pageSize: 256|512|1024|2048|4096 = 4096;
}
export class ExportSettingsDialog {

    public prompt(): ExportSettings|null {
        let doc = fl.getDocumentDOM();
        let save = {
            exportType: doc.documentHasData("fnx.export.exportType") ? doc.getDataFromDocument("fnx.export.exportType") : "library",
            exportPath: doc.documentHasData("fnx.export.exportPath") ? doc.getDataFromDocument("fnx.export.exportPath") : path.getProjectPrefix() + ".zfl",
            padding: doc.documentHasData("fnx.export.padding") ? doc.getDataFromDocument("fnx.export.padding") : "8",
            pageSize: doc.documentHasData("fnx.export.pageSize") ? doc.getDataFromDocument("fnx.export.pageSize") : "4096"
        }

        let panel = `<dialog id="dialog"	title="Export Project" buttons="accept, cancel">
            <script>
                function getFolderPath() {
                    var uri = fl.browseForFileURL("save", "Select export path", "Flash Archive (*.zfl)", "zfl");
                    fl.xmlui.set("exportPath", FLfile.uriToPlatformPath(uri));
                    fl.getDocumentDOM().addDataToDocument("fnx.export.exportPath", "string", FLfile.uriToPlatformPath(uri));
                }
            </script>

            <label value="Export:"/>
            <radiogroup id="exportType">
                <radio type="menu-button" label="Document" width="50" ${save.exportType == "document" ? 'selected="true"':''} value="document"></radio>
                <radio type="menu-button" label="Library (root items)"  width="50" ${save.exportType == "library" ? 'selected="true"':''} value="library"></radio>
                <radio type="menu-button" label="Active screen" width="50" ${save.exportType == "selected" ? 'selected="true"':''} value="selected"></radio>
            </radiogroup>
            
            <separator/>			
            <spacer/>
            
            <label value="Atlas packing:"/>
            <hbox>
                <label value="    Padding:"/>
                <textbox id="padding" value="${save.padding}" width="50"/>
                <label value="px"/>
            </hbox>
            <spacer/>
            <hbox>
                <label value="    Maximum page size:"/>
                <menulist id="pageSize" width="100">
                    <menupopup>
                        <menuitem label="4096" id="4096" ${save.pageSize == "4096" ? 'selected="true"':''}/>
                        <menuitem label="2048" id="2048" ${save.pageSize == "2048" ? 'selected="true"':''}/>
                        <menuitem label="1024" id="1024" ${save.pageSize == "1024" ? 'selected="true"':''}/>
                        <menuitem label="512" id="512" ${save.pageSize == "512" ? 'selected="true"':''}/>
                        <menuitem label="256" id="256" ${save.pageSize == "256" ? 'selected="true"':''}/>
                    </menupopup>
                </menulist>
                <label value="px"/>
            </hbox>

            <separator/>			
            <spacer/>
            
            <label value="Export path"/>
            <hbox>
                <label value="    "/>
                <button type="menu-button" label="Browse..." width="50" oncommand="getFolderPath();"></button>
                <textbox id="exportPath" width="400" value="${save.exportPath}"/>
            </hbox>

            <script>
                fl.xmlui.setControlItemElement("library", {selected:"true"});
            </script>
        </dialog>`;

        let dialogResponse = fl.xmlPanelFromString(panel)
        doc.addDataToDocument("fnx.export.exportType", "string", dialogResponse["exportType"]);
        doc.addDataToDocument("fnx.export.exportPath", "string", dialogResponse["exportPath"]);
        doc.addDataToDocument("fnx.export.padding", "string", dialogResponse["padding"]);
        doc.addDataToDocument("fnx.export.pageSize", "string", dialogResponse["pageSize"]);

        if (dialogResponse["dismiss"] == "cancel") {
            return null;
        }
        
        let settings = new ExportSettings();
        settings.exportPath = dialogResponse["exportPath"] as string;
        settings.padding = Number(dialogResponse["padding"]) || 8;
        switch (Number(dialogResponse["pageSize"])) {
            case 256: settings.pageSize = 256; break;
            case 512: settings.pageSize = 512; break;
            case 1024: settings.pageSize = 1024; break;
            case 2048: settings.pageSize = 2048; break;
            case 4096: settings.pageSize = 4096; break;
            default: settings.pageSize = 4096;
        }
        switch (dialogResponse["exportType"]) {
            case "document": settings.exportType = "document"; break;
            case "library": settings.exportType = "library"; break;
            case "selected": settings.exportType = "selected"; break;
            default: settings.exportType = "library";
        }
        return settings;
    }
}