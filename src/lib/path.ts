export function normalize(path: string) {
    path = path.replace("\\", "/");
    while (path.search("//") >= 0) {
        path = path.replace("//", "/");
    }
    return path;
}
export function base(path: string): string {
    let parts = normalize(path).split("/");
    parts.pop();
    return parts.join("/")
}

export function file(path: string): string {
    let parts = normalize(path).split("/");
    return parts[parts.length-1];
}