export function normalize(path: string): string {
    path = path.replace("\\", "/");
    while (path.search("//") >= 0) {
        path = path.replace("//", "/");
    }
    while (path.endsWith("/")) {
        path = path.substr(0, path.length-1);
    }
    return path
}
export function base(path: string): string {
    let parts = normalize(path).split("/");
    parts.pop();
    return parts.join("/");
}

export function file(path: string): string {
    let parts = normalize(path).split("/");
    return parts[parts.length-1];
}

// returns current project path prefix based on project format (fla or xfl):
// `/path/to/project` for `/path/to/project/project.xfl
// `/path/ro/project` for `/path/to/project.fla`

export function getProjectPrefix(): string {
    let doc = fl.getDocumentDOM();
    if (doc.path.endsWith(".fla")) {
        let fileName = file(doc.path);
        return base(doc.path) + "/" + fileName.substr(0, fileName.length - 4);
    } else {
        return base(doc.path);
    }
}