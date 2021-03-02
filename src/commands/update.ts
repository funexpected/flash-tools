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

import { invoke } from "../lib/tools";
import * as version from "../lib/version";

interface UpdateResult {
    status: 'updated'|'already_latest';
    path: string|null;
    version: string|null;
}

let updateResult = invoke("update", { from_version: version.STRING }) as UpdateResult;

if (updateResult.status == 'already_latest') {
    alert("You have latest version of Funexpected Tools");
} else {
    let updatedFolderURI = FLfile.platformPathToURI(updateResult.path as string);
    let targetFolderURI = FLfile.platformPathToURI(`${fl.configDirectory}Commands/Funexpected Tools/`);
    for (let file of FLfile.listFolder(targetFolderURI, 'files')) {
        let targetURI = FLfile.platformPathToURI(`${fl.configDirectory}Commands/Funexpected Tools/${file}`);
        FLfile.remove(targetURI);
    }
    for (let file of FLfile.listFolder(updatedFolderURI, 'files')) {
        let targetURI = FLfile.platformPathToURI(`${fl.configDirectory}Commands/Funexpected Tools/${file}`);
        FLfile.copy(`${updatedFolderURI}/${file}`, targetURI);
    }

    let isOSX = (fl.version.indexOf("MAC") != -1);
    if (isOSX) {
        let toolkitPath = FLfile.platformPathToURI(`${fl.configDirectory}Commands/Funexpected Tools/toolkit`);
        FLfile.runCommandLine(`chmod a+x "${toolkitPath}"`);
    }
    FLfile.remove(updatedFolderURI);
    alert(`Funexpected Tools updated to ${updateResult.version}`);
}