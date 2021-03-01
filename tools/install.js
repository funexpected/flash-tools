const glob = require('glob');
const home = require('os').homedir();
const fs = require('fs');

const compiledDir = 'out/compiled'

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

let targetDirs = glob.sync(`${home}/Library/ApplicationSupport/Adobe/Animate*/*/Configuration/Commands/`);
targetDirs.forEach(target => {
    let toolsDir = `${target}/Funexpected Tools`
    if (fs.existsSync(toolsDir)) {
        fs.rmdirSync(toolsDir, { recursive: true });
    }
    fs.mkdirSync(toolsDir);
    
    fs.readdirSync(compiledDir).forEach(cmd => {
        //let destFileName = cmd.substr(0, cmd.length-3).split("_").map(p => p.capitalize()).join(" ") + ".jsfl";
        console.log(`cp ${compiledDir}/${cmd} ${toolsDir}/${cmd}`);
        fs.copyFileSync(`${compiledDir}/${cmd}`, `${toolsDir}/${cmd}`);
    })
})

