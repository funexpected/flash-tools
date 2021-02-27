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



export function normalize(path: string): string {
    while (path.indexOf("\\") >= 0) {
        path = path.replace("\\", "/");
    }
    while (path.indexOf("//") >= 0) {
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